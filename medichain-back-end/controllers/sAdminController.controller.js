"use strict";
import mongoose from "mongoose";
import errors from "../app/error/genericErrors.js";
import {
  dbConnection,
  isNetworkRunning,
  sendNetworkStatus,
  updateNetworkStatus,
  isNetworkStopped,
} from "../app/utils/utilsFns.js";
import { associatedOrganizationForNetworkModelString } from "../app/constants/model/modelContants.js";
import { networkStatus } from "../app/constants/model/networkStatusConstants.js";
import { adminType } from "../app/constants/config/userRoles.js";
import { errResponse, mongooseValidationErrors, otherErrResponse } from "../app/error/apiError.class.js";
import { networkModel } from "../models/network.model.js";
import { organizationModel } from "../models/organization.model.js";
import { UsersModel } from "../models/users.model.js";
import { generateAndRunNetworkConfiguration, stopHLFNetwork } from "./asyncViews/networkSetup.js";
import { dockerPortsModel } from "../models/dockerPorts.model.js";
import { GET_ONLY } from "../app/constants/common/constants.js";
import { enrollAdmin } from "../app/utils/userRegisterEnroll.js";

// Options - Network, Status, Organization. If only want Network, if want network and status, if want all the three
const getNetworkAndOrganization = async (params, definitionType = GET_ONLY.ORGANIZATION, silentErrors = false) => {
  const { netId, orgId, networkShouldRun } = params;

  let network, organization, status;
  try {
    if (!netId) {
      if (silentErrors) return {};
      throw errResponse(errors.not_found, "Required params : [netId] is missing");
    }
    network = await networkModel.findById(netId);
    if (!network) {
      if (silentErrors) return {};
      throw errResponse(errors.not_found, `Network with networkId: ${netId} was not found`);
    }
    if (definitionType === GET_ONLY.NETWORK) return { foundNetwork: network };
    status = isNetworkRunning(network.status);
    if (status !== networkShouldRun) {
      if (silentErrors) return { foundNetwork: network };
      throw errResponse(
        errors.bad_request_orgs,
        `To add alter organizations, please ${networkShouldRun ? "start" : "stop"} the network first`
      );
    }
    if (definitionType === GET_ONLY.STATUS) return { foundNetwork: network, isNetworkRunning: status };
    if (!orgId) {
      if (silentErrors) return { foundNetwork: network, isNetworkRunning: status };
      throw errResponse(errors.not_found, "Required params : [orgId] is missing");
    }
    organization = await organizationModel.findById(orgId);
    if (!organization) {
      if (silentErrors) return { foundNetwork: network, isNetworkRunning: status };
      throw errResponse(errors.not_found, `Organization with orgId: ${orgId} was not found`);
    }
    return { foundNetwork: network, isNetworkRunning: status, organization };
  } catch (err) {
    if (err?.name === "CastError") throw errResponse(errors.bad_input, `The netId/orgId is not valid or not correct`);
    throw otherErrResponse(err);
  }
};

export const fetchWholeNetworkWithSuperAdmin = async (req, res) => {
  // ?id={}&filter={}
  const { id, filter } = req.query;
  try {
    const network = id
      ? await networkModel.findById(id).populate(associatedOrganizationForNetworkModelString)
      : await networkModel.find().populate(associatedOrganizationForNetworkModelString);
    if (!network)
      return res.status(400).json(errResponse(errors.bad_input, `The requested network data was not found`));
    return res.status(200).json(filter ? network[filter] : network);
  } catch (err) {
    if (err?.name === "CastError")
      return res.status(400).json(errResponse(errors.bad_input, `The id is not valid or not correct`));
    if (err instanceof mongoose.mongo.MongoServerError) err = mongooseValidationErrors(err);
    return res.status(err?.status ?? 404).json(otherErrResponse(err));
  }
};

export const createNetworkWithSuperAdmin = async (req, res) => {
  const { netName: name, netId, address } = req.body;
  if (!name || !netId || !address)
    return res.status(400).json(errResponse(errors.not_found, "Required fields are missing"));
  try {
    await networkModel.create({ name, netId, address });
    return res.status(200).json({ message: `Network with name: ${name} was successfully created` });
  } catch (err) {
    if (err instanceof mongoose.mongo.MongoServerError || err instanceof mongoose.Error.ValidationError)
      err = mongooseValidationErrors(err);
    return res.status(err?.status ?? 500).json(otherErrResponse(err));
  }
};

export const createOrganizationWithSuperAdmin = async (req, res) => {
  const { fullName, nameId, adminUserId, adminPassword, country, state, city, netId } = req.body;
  if (!fullName || !nameId || !adminUserId || !adminPassword || !country || !state || !city || !netId)
    return res.status(400).json(errResponse(errors.not_found, "Required fields are missing"));

  try {
    const { foundNetwork } = await getNetworkAndOrganization({ netId, networkShouldRun: false }, GET_ONLY.STATUS);
    const session = await dbConnection.startSession();
    try {
      session.startTransaction();
      const organization = (
        await organizationModel.create(
          [
            {
              fullName,
              nameId,
              adminUserId,
              adminPassword,
              country,
              state,
              city,
            },
          ],
          { session }
        )
      )[0];

      await dockerPortsModel.findOneAndUpdate({ p0port: organization.p0Port }, { reserved: true });
      // create user for admin
      await UsersModel.create(
        [
          {
            userId: adminUserId,
            password: adminPassword,
            type: adminType,
            associatedOrganization: organization._id,
          },
        ],
        { session }
      );
      // update network with organization
      await foundNetwork.updateOne(
        { status: networkStatus.reset, $push: { associatedOrganizations: organization._id } },
        { new: true, useFindAndModify: false, session }
      );

      await session.commitTransaction();
      res.status(200).json({ message: `Organization with nameId: ${nameId} was successfully created` });
    } catch (err) {
      await session.abortTransaction();
      if (err instanceof mongoose.mongo.MongoServerError || err instanceof mongoose.Error.ValidationError)
        err = mongooseValidationErrors(err);
      res.status(err?.status ?? 500).json(otherErrResponse(err));
    } finally {
      await session.endSession();
      return res;
    }
  } catch (responseErr) {
    return res.status(parseInt(responseErr.HTTP)).json(responseErr);
  }
};

export const enrollOrganizationWithSuperAdmin = async (req, res) => {
  const { netId, orgId } = req.params;
  try {
    const { foundNetwork, organization } = await getNetworkAndOrganization(
      { netId, orgId, networkShouldRun: true },
      GET_ONLY.ORGANIZATION
    );
    // Already enrolled
    if (organization.enrolled) return res.sendStatus(200);
    const session = await dbConnection.startSession();
    try {
      session.startTransaction();
      const user = await enrollAdmin(foundNetwork.address, organization.nameId);
      await organization.update({ enrolled: true });
      res.status(200).json(user);
    } catch (err) {
      await session.abortTransaction();
      if (err instanceof mongoose.mongo.MongoServerError) err = mongooseValidationErrors(err);
      res.status(err?.status ? err.status : 500).json(otherErrResponse(err));
    } finally {
      await session.endSession();
      return res;
    }
  } catch (responseErr) {
    return res.status(parseInt(responseErr.HTTP)).json(responseErr);
  }
};

export const deleteOrganizationWithSuperAdmin = async (req, res) => {
  const { netId, orgId } = req.params;

  try {
    const { foundNetwork: network, organization } = await getNetworkAndOrganization(
      { netId, orgId, networkShouldRun: false },
      GET_ONLY.ORGANIZATION,
      true
    );

    if (!network || !organization) return res.sendStatus(204);
    const session = await dbConnection.startSession();
    try {
      session.startTransaction();
      // Delete Organization From Users
      await UsersModel.deleteMany({ associatedOrganization: organization._id }, { session });
      // Delete Organization From Network Model
      await network
        .updateOne({ $pullAll: { associatedOrganizations: [{ _id: organization._id }] } }, { session })
        .exec();

      // Unreserve the docker ports reserved while creation
      await dockerPortsModel.findOneAndUpdate({ p0port: organization.p0Port }, { reserved: false });

      // Finally delete organization itself
      await organization.delete({ session });

      await session.commitTransaction();
      res.status(200).json({ message: `Organization with nameId: ${orgId} was successfully deleted` });
    } catch (err) {
      await session.abortTransaction();
      if (err instanceof mongoose.mongo.MongoServerError) err = mongooseValidationErrors(err);
      res.status(err?.status ? err.status : 500).json(otherErrResponse(err));
    } finally {
      await session.endSession();
      return res;
    }
  } catch (responseErr) {
    return res.status(parseInt(responseErr.HTTP)).json(responseErr);
  }
};

export const startHLFNetworkWithSuperAdmin = async (req, res) => {
  const { netId } = req.body;
  if (!netId) return res.status(400).json(errResponse(errors.not_found, "Network Id not found or missing"));
  try {
    const network = await networkModel.findById(netId).populate(associatedOrganizationForNetworkModelString);
    if (!network)
      return res.status(400).json(errResponse(errors.bad_input, `The requested network data was not found`));

    if (network.associatedOrganizations.length === 0 || isNetworkRunning(network.status))
      return res.status(200).json(sendNetworkStatus(network._id, network.status));

    await updateNetworkStatus(network, networkStatus.pendingToStart);
    generateAndRunNetworkConfiguration(network);

    return res
      .status(200)
      .json({ ...networkStatus.pendingToStart, message: "Request to start network was successful" });
  } catch (err) {
    if (err instanceof mongoose.mongo.MongoServerError || err instanceof mongoose.Error.ValidationError)
      err = mongooseValidationErrors(err);
    return res.status(err?.status ?? 500).json(otherErrResponse(err));
  }
};

export const stopHLFNetworkWithSuperAdmin = async (req, res) => {
  const { netId } = req.body;
  if (!netId) return res.status(400).json(errResponse(errors.not_found, "Network Id not found or missing"));

  try {
    const network = await networkModel.findById(netId);
    if (!network) return res.status(400).json(errResponse(errors.bad_input, `The requested network does not exists`));

    if (isNetworkStopped(network.status)) return res.status(200).json(sendNetworkStatus(network._id, network.status));

    await updateNetworkStatus(network, networkStatus.pendingToStop);
    await organizationModel.updateMany({}, { enrolled: false });
    stopHLFNetwork(network);

    return res.status(200).json({ ...networkStatus.pendingToStop, message: "Request to stopt network was successful" });
  } catch (err) {
    if (err instanceof mongoose.mongo.MongoServerError || err instanceof mongoose.Error.ValidationError)
      err = mongooseValidationErrors(err);
    return res.status(err?.status ?? 500).json(otherErrResponse(err));
  }
};
