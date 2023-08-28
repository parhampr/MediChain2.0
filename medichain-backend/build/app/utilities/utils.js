import { SALT_WORK_FACTOR } from "../configs/Defaults";
import Environment from "../configs/Environment";
import bcrypt from "bcrypt";
import path from "path";
import jwt from "jsonwebtoken";
class UtilFuncs {
    getHashFor = async (value) => await bcrypt.hash(value, SALT_WORK_FACTOR);
    isNetworkRunning = (status) => status.code === 200 || status.code === 509 || status.code === 300;
    sendNetworkStatus = (network) => ({ _id: network._id, status: network.status });
    updateNetworkStatus = async (network, status) => await network.updateOne({ status });
    getOrganizationPath = (server, org) => path.join(Environment.ORGANIZATION_BASE, `${org?.toLowerCase()}.${server.toLowerCase()}`, `connection-${org?.toLowerCase()}.json`);
    getWalletPath = (org) => path.join(Environment.WALLET_BASE, org.trim());
    signJWTToken = (obj, secret, expiration) => jwt.sign(obj, secret, { expiresIn: expiration });
    shellStringToGenerateConfig = (network) => {
        let executionString = `-netName "${network.name}" -netID ${network.netId} -netAdd ${network.address} `;
        for (const org of network.associatedOrganizations)
            executionString += `-org ${org.nameId} ${org.adminUserId} ${org.adminPassword} "${org.country}" "${org.state}" "${org.city}" ${org.p0Port} ${org.caPort} ${org.couchPort} `;
        return executionString;
    };
}
export default new UtilFuncs();
//# sourceMappingURL=utils.js.map