import { UsersModel } from "../../models/users.model.js";
import { SALT_WORK_FACTOR, defaultSuperAdminPassword, defaultSuperAdminUserId } from "../constants/config/defaults.js";
import { superAdminType } from "../constants/config/userRoles.js";
import {
  caPortAttribute,
  couchPortAttribute,
  p0PortAttribute,
  reservedAttribute,
} from "../constants/common/constants.js";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { dockerPortsModel } from "../../models/dockerPorts.model.js";
import { rootAppDirectory, serverPortsForDocker } from "../constants/config/env.js";
import path from "path";

mongoose.set("strictQuery", true);

const dockerPorts = serverPortsForDocker
  .toString()
  .split("|")
  .map((portArray) => {
    const ports = portArray.toString().split(":");
    return {
      [p0PortAttribute]: parseInt(ports[0]),
      [caPortAttribute]: parseInt(ports[1]),
      [couchPortAttribute]: parseInt(ports[2]),
      [reservedAttribute]: false,
    };
  });

export const dbConnection = mongoose.connection;
export const walletPath = (org) => path.join(rootAppDirectory, "app", "wallet", String(org));
export const organisationPath = (netServer, orgName) =>
  path.join(
    rootAppDirectory,
    "ApplicationNetwork",
    "organizations",
    "peerOrganizations",
    `${orgName?.toLowerCase()}.${netServer.toLowerCase()}`,
    `connection-${orgName?.toLowerCase()}.json`
  );

export const getHashFor = async (value) => await bcrypt.hash(value, SALT_WORK_FACTOR);
export const signJwtToken = (obj, secret, expiration) => jwt.sign(obj, secret, { expiresIn: expiration });
export const sendNetworkStatus = (_id, status) => ({ _id, status });
export const isNetworkRunning = (status) => status.code === 200 || status.code === 509 || status.code === 300;
export const isNetworkStopped = (status) => status.code === 0 || status.code === 400 || status.code === 500;
export const updateNetworkStatus = async (network, status) => await network.updateOne({ status });
export const shellStringToGenerateConfig = (network) => {
  let executionString = `-netName "${network.name}" -netID ${network.netId} -netAdd ${network.address} `;
  for (const org of network.associatedOrganizations)
    executionString += `-org ${org.nameId} ${org.adminUserId} ${org.adminPassword} "${org.country}" "${org.state}" "${org.city}" ${org.p0Port} ${org.caPort} ${org.couchPort} `;
  return executionString;
};

export const onStartUp = {
  connectMongoDB(dbURL) {
    return mongoose.connect(`${dbURL}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  },
  async createSuperUser() {
    const superAdminUser = await UsersModel.findOne({ userId: defaultSuperAdminUserId });
    if (!superAdminUser) {
      try {
        await UsersModel.create({
          userId: defaultSuperAdminUserId,
          password: defaultSuperAdminPassword,
          type: superAdminType,
        });
      } catch (error) {
        console.error(err);
        process.exit(1);
      }
    }
  },

  async createDockerPorts() {
    const portCount = await dockerPortsModel.count();
    if (portCount < dockerPorts.length) {
      try {
        await dockerPortsModel.create(dockerPorts);
      } catch (error) {
        console.error(err);
        process.exit(1);
      }
    }
  },
};
