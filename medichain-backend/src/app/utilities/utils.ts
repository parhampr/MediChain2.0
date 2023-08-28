import { SALT_WORK_FACTOR } from "@Config/Defaults";
import Environment from "@Config/Environment";
import { INetwork, INetworkStatusDetail, IOrganization } from "@Interfaces/models";
import bcrypt from "bcrypt";
import path from "path";
import jwt from "jsonwebtoken";
import { MergeType, Types } from "mongoose";

class UtilFuncs {
  public getHashFor = async (value: string) => await bcrypt.hash(value, SALT_WORK_FACTOR);
  public isNetworkRunning = (status: INetworkStatusDetail) =>
    status.code === 200 || status.code === 509 || status.code === 300;
  public sendNetworkStatus = (network: INetwork) => ({ _id: network._id, status: network.status });
  public updateNetworkStatus = async (network: INetwork, status: INetworkStatusDetail) =>
    await network.updateOne({ status });
  public getOrganizationPath = (server: string, org: string) =>
    path.join(
      Environment.ORGANIZATION_BASE,
      `${org?.toLowerCase()}.${server.toLowerCase()}`,
      `connection-${org?.toLowerCase()}.json`,
    );
  public getWalletPath = (org: string) => path.join(Environment.WALLET_BASE, org.trim());
  public signJWTToken = (obj: Object, secret: string, expiration: string) =>
    jwt.sign(obj, secret, { expiresIn: expiration });

  public shellStringToGenerateConfig = (
    network: MergeType<INetwork & { _id: Types.ObjectId }, { associatedOrganizations: IOrganization[] }>,
  ) => {
    let executionString = `-netName "${network.name}" -netID ${network.netId} -netAdd ${network.address} `;
    for (const org of network.associatedOrganizations)
      executionString += `-org ${org.nameId} ${org.adminUserId} ${org.adminPassword} "${org.country}" "${org.state}" "${org.city}" ${org.p0Port} ${org.caPort} ${org.couchPort} `;
    return executionString;
  };
}

export default new UtilFuncs();
