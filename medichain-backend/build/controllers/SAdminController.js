import { NETWORK_STATUS } from "../app/configs/Network";
import { GET_ATTRIBUTES, ROLE } from "../app/constants/Common";
import { Model_ATTRIBUTES } from "../app/constants/Models";
import { errResponse, mongooseValidationErrors, otherErrResponse } from "../errors/ApiError";
import errors from "../errors/GenericErrors";
import { dockerPortsModel } from "../models/dockerports";
import { networkModel } from "../models/network";
import { organizationModel } from "../models/organization";
import { UsersModel } from "../models/users";
import networkInitialization from "../app/utilities/NetworkInitialize";
import utils from "../app/utilities/utils";
import mongoose from "mongoose";
import { generateAndRunNetworkConfiguration, stopHLFNetwork } from "./asyncViews";
class SAdminController {
    dbConnection;
    constructor() {
        this.dbConnection = mongoose.connection;
        this.getNetworkAndOrganization = this.getNetworkAndOrganization.bind(this);
    }
    // Options - Network, Status, Organization. If only want Network, if want network and status, if want all the three
    async getNetworkAndOrganization(params, definitionType = GET_ATTRIBUTES.ORGANIZATION, networkShouldRun = false, silentErrors = false) {
        const { netId, orgId } = params;
        let network, organization, status;
        try {
            if (!netId) {
                if (silentErrors)
                    return {};
                throw errResponse(errors.not_found, "Required params : [netId] is missing");
            }
            network = await networkModel.findById(netId);
            if (!network) {
                if (silentErrors)
                    return {};
                throw errResponse(errors.not_found, `Network with networkId: ${netId} was not found`);
            }
            if (definitionType === GET_ATTRIBUTES.NETWORK)
                return { foundNetwork: network };
            status = utils.isNetworkRunning(network.status);
            if (status !== networkShouldRun) {
                if (silentErrors)
                    return { foundNetwork: network };
                throw errResponse(errors.bad_request_orgs, `To add alter organizations, please ${networkShouldRun ? "start" : "stop"} the network first`);
            }
            if (definitionType === GET_ATTRIBUTES.STATUS)
                return { foundNetwork: network, isNetworkRunning: status };
            if (!orgId) {
                if (silentErrors)
                    return { foundNetwork: network, isNetworkRunning: status };
                throw errResponse(errors.not_found, "Required params : [orgId] is missing");
            }
            organization = await organizationModel.findById(orgId);
            if (!organization) {
                if (silentErrors)
                    return { foundNetwork: network, isNetworkRunning: status };
                throw errResponse(errors.not_found, `Organization with orgId: ${orgId} was not found`);
            }
            return { foundNetwork: network, isNetworkRunning: status, organization };
        }
        catch (err) {
            if (err?.name === "CastError")
                throw errResponse(errors.bad_input, `The netId/orgId is not valid or not correct`);
            throw otherErrResponse(err);
        }
    }
    fetchWholeNetworkWithSuperAdmin = async (req, res) => {
        // ?id=#&filter=#&orgId=#
        const { id, filter } = req.query;
        try {
            if (id) {
                const network = await (await this.getNetworkAndOrganization({ netId: id }, GET_ATTRIBUTES.NETWORK)).foundNetwork.populate(Model_ATTRIBUTES.associatedOrganizationPropForNetwork);
                return res.status(200).json(filter ? network[filter] : network);
            }
            const network = await networkModel
                .find()
                .populate(Model_ATTRIBUTES.associatedOrganizationPropForNetwork);
            return res.status(200).json(filter ? network[filter] : network);
        }
        catch (err) {
            if (err?.name === "CastError")
                return res.status(400).json(errResponse(errors.bad_input, `The id is not valid or not correct`));
            if (err instanceof mongoose.mongo.MongoServerError)
                err = mongooseValidationErrors(err);
            console.log(err);
            return res.status(err?.status ?? 500).json(otherErrResponse(err));
        }
    };
    createNetworkWithSuperAdmin = async (req, res) => {
        const { netName, netId, address } = req.body;
        if (!netName || !netId || !address)
            return res.status(400).json(errResponse(errors.not_found, "Required fields are missing"));
        try {
            await networkModel.create({ name: netName, netId, address });
            return res.status(200).json({ message: `Network with name: ${netName} was successfully created` });
        }
        catch (err) {
            if (err instanceof mongoose.mongo.MongoServerError || err instanceof mongoose.Error.ValidationError)
                err = mongooseValidationErrors(err);
            console.log(err);
            return res.status(err?.status ?? 500).json(otherErrResponse(err));
        }
    };
    createOrganizationWithSuperAdmin = async (req, res) => {
        const { fullName, nameId, adminUserId, adminPassword, country, state, city, netId } = req.body;
        if (!fullName || !nameId || !adminUserId || !adminPassword || !country || !state || !city || !netId)
            return res.status(400).json(errResponse(errors.not_found, "Required fields are missing"));
        try {
            const { foundNetwork } = await this.getNetworkAndOrganization({ netId }, GET_ATTRIBUTES.NETWORK);
            const session = await this.dbConnection.startSession();
            try {
                session.startTransaction();
                const organization = (await organizationModel.create([
                    {
                        fullName,
                        nameId,
                        adminUserId,
                        adminPassword,
                        country,
                        state,
                        city,
                    },
                ], { session }))[0];
                await dockerPortsModel.findOneAndUpdate({ p0port: organization.p0Port }, { reserved: true });
                // create user for admin
                await UsersModel.create([
                    {
                        userId: adminUserId,
                        password: adminPassword,
                        type: ROLE.admin,
                        associatedOrganization: organization._id,
                    },
                ], { session });
                // update network with organization
                await foundNetwork.updateOne({ status: NETWORK_STATUS.reset, $push: { associatedOrganizations: organization._id } }, { new: true, useFindAndModify: false, session });
                await session.commitTransaction();
                res.status(200).json({ message: `Organization with nameId: ${nameId} was successfully created` });
            }
            catch (err) {
                await session.abortTransaction();
                if (err instanceof mongoose.mongo.MongoServerError || err instanceof mongoose.Error.ValidationError)
                    err = mongooseValidationErrors(err);
                console.log(err);
                res.status(err?.status ?? 500).json(otherErrResponse(err));
            }
            finally {
                await session.endSession();
                return res;
            }
        }
        catch (responseErr) {
            return res.status(parseInt(responseErr.HTTP)).json(responseErr);
        }
    };
    enrollOrganizationWithSuperAdmin = async (req, res) => {
        const { netId, orgId } = req.params;
        try {
            const { foundNetwork, organization } = await this.getNetworkAndOrganization({ netId, orgId }, GET_ATTRIBUTES.ORGANIZATION, true);
            // Already enrolled
            if (organization.enrolled)
                return res.sendStatus(200);
            const session = await this.dbConnection.startSession();
            try {
                session.startTransaction();
                const user = await networkInitialization.enrollAdmin(foundNetwork.address, organization.nameId);
                await organization.updateOne({ enrolled: true });
                res.status(200).json(user);
            }
            catch (err) {
                await session.abortTransaction();
                if (err instanceof mongoose.mongo.MongoServerError)
                    err = mongooseValidationErrors(err);
                console.log(err);
                res.status(err?.status ? err.status : 500).json(otherErrResponse(err));
            }
            finally {
                await session.endSession();
                return res;
            }
        }
        catch (responseErr) {
            return res.status(parseInt(responseErr.HTTP)).json(responseErr);
        }
    };
    deleteOrganizationWithSuperAdmin = async (req, res) => {
        const { netId, orgId } = req.params;
        try {
            const { foundNetwork: network, organization } = await this.getNetworkAndOrganization({ netId, orgId }, GET_ATTRIBUTES.ORGANIZATION, false, true);
            if (!network || !organization)
                return res.sendStatus(204);
            const session = await this.dbConnection.startSession();
            try {
                session.startTransaction();
                // Delete Organization From Users
                await UsersModel.deleteMany({ associatedOrganization: organization._id }, { session });
                // Delete Organization From Network Model
                await network.updateOne({ $pullAll: { associatedOrganizations: [{ _id: organization._id }] } }, { session });
                // Unreserve the docker ports reserved while creation
                await dockerPortsModel.findOneAndUpdate({ p0port: organization.p0Port }, { reserved: false });
                // Finally delete organization itself
                await organization.deleteOne({ session });
                await session.commitTransaction();
                res.status(200).json({ message: `Organization with nameId: ${orgId} was successfully deleted` });
            }
            catch (err) {
                await session.abortTransaction();
                if (err instanceof mongoose.mongo.MongoServerError)
                    err = mongooseValidationErrors(err);
                console.log(err);
                res.status(err?.status ? err.status : 500).json(otherErrResponse(err));
            }
            finally {
                await session.endSession();
                return res;
            }
        }
        catch (responseErr) {
            return res.status(parseInt(responseErr.HTTP)).json(responseErr);
        }
    };
    startHLFNetworkWithSuperAdmin = async (req, res) => {
        const { netId } = req.body;
        if (!netId)
            return res.status(400).json(errResponse(errors.not_found, "Network Id not found or missing"));
        try {
            const network = await networkModel.findById(netId);
            if (!network)
                return res.status(400).json(errResponse(errors.bad_input, `The requested network data was not found`));
            if (network.associatedOrganizations.length === 0 || utils.isNetworkRunning(network.status))
                return res.status(200).json(utils.sendNetworkStatus(network));
            await utils.updateNetworkStatus(network, NETWORK_STATUS.pendingToStart);
            const populatedNetwork = await network.populate(Model_ATTRIBUTES.associatedOrganizationPropForNetwork);
            // asynchronously run network
            generateAndRunNetworkConfiguration(network, utils.shellStringToGenerateConfig(populatedNetwork));
            return res.status(200).json({ ...NETWORK_STATUS.pendingToStart, message: "Request to start network was successful" });
        }
        catch (err) {
            if (err instanceof mongoose.mongo.MongoServerError || err instanceof mongoose.Error.ValidationError)
                err = mongooseValidationErrors(err);
            console.log(err);
            return res.status(err?.status ?? 500).json(otherErrResponse(err));
        }
    };
    stopHLFNetworkWithSuperAdmin = async (req, res) => {
        const { netId } = req.body;
        if (!netId)
            return res.status(400).json(errResponse(errors.not_found, "Network Id not found or missing"));
        try {
            const network = await networkModel.findById(netId);
            if (!network)
                return res.status(400).json(errResponse(errors.bad_input, `The requested network does not exists`));
            if (!utils.isNetworkRunning(network.status))
                return res.status(200).json(utils.sendNetworkStatus(network));
            await utils.updateNetworkStatus(network, NETWORK_STATUS.pendingToStop);
            await organizationModel.updateMany({}, { enrolled: false });
            // asynchronously stop network
            stopHLFNetwork(network);
            return res.status(200).json({ ...NETWORK_STATUS.pendingToStop, message: "Request to stopt network was successful" });
        }
        catch (err) {
            if (err instanceof mongoose.mongo.MongoServerError || err instanceof mongoose.Error.ValidationError)
                err = mongooseValidationErrors(err);
            console.log(err);
            return res.status(err?.status ?? 500).json(otherErrResponse(err));
        }
    };
}
export default new SAdminController();
//# sourceMappingURL=SAdminController.js.map