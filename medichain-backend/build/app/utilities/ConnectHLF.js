"use strict";
import { existsSync, readFileSync } from "fs";
import utils from "./utils";
import { Wallets } from "fabric-network";
import FabricCAServices from "fabric-ca-client";
import errors from "../../errors/GenericErrors";
class ConnectHLF {
    constructor() {
        this.buildCCPOrg = this.buildCCPOrg.bind(this);
        this.buildCAClient = this.buildCAClient.bind(this);
    }
    // load the common connection configuration file
    buildCCPOrg = (netServer, orgName) => {
        const ccpPath = utils.getOrganizationPath(netServer, orgName);
        const fileExists = existsSync(ccpPath);
        if (!fileExists) {
            throw errors.invalid_host_organization.withDescription("Make sure your organization is enrolled and added into the network, then try again");
        }
        const contents = readFileSync(ccpPath, "utf8");
        const ccp = JSON.parse(contents);
        if (!ccp.organizations[orgName]) {
            throw errors.invalid_host_organization.withDescription("Make sure your organization is enrolled and added into the network, then try again");
        }
        return ccp;
    };
    // Create a new CA client for interacting with the CA.
    buildCAClient = (ccp, orgName) => {
        const caInfo = ccp.certificateAuthorities[ccp.organizations[orgName].certificateAuthorities[0]]; //lookup CA details from config
        if (!caInfo)
            throw errors.file_not_found.withDescription("Configuration Files: caInfo are missing");
        const caTLSCACerts = caInfo?.tlsCACerts?.pem;
        if (!caTLSCACerts)
            throw errors.file_not_found.withDescription("Configuration Files: caTLSCACerts are missing");
        const caClient = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);
        return caClient;
    };
    connectInitializeHLF = async (netServer, orgName) => {
        const ccp = this.buildCCPOrg(netServer, orgName);
        const caClient = this.buildCAClient(ccp, orgName);
        const walletDes = utils.getWalletPath(orgName);
        const wallet = await (walletDes ? Wallets.newFileSystemWallet(walletDes) : Wallets.newInMemoryWallet());
        return { caClient, wallet, ccp };
    };
}
export default new ConnectHLF();
//# sourceMappingURL=ConnectHLF.js.map