"use strict";

import { existsSync, readFileSync } from "fs";
import { organisationPath, walletPath } from "./utilsFns.js";
import { Wallets } from "fabric-network";
import FabricCAServices from "fabric-ca-client";
import errors from "../error/genericErrors.js";

// load the common connection configuration file
const buildCCPOrg = (netServer, orgName) => {
  const ccpPath = organisationPath(netServer, orgName);
  const fileExists = existsSync(ccpPath);
  if (!fileExists) {
    throw errors.invalid_host_organization.withDescription(
      "Make sure your organisation is enrolled and added into the network, then try again"
    );
  }
  const contents = readFileSync(ccpPath, "utf8");
  const ccp = JSON.parse(contents);
  if (!ccp.organizations[orgName]) {
    throw errors.invalid_host_organization.withDescription(
      "Make sure your organisation is enrolled and added into the network, then try again"
    );
  }
  return ccp;
};

// Create a new CA client for interacting with the CA.
const buildCAClient = (ccp, orgName) => {
  const caInfo = ccp.certificateAuthorities[ccp.organizations[orgName].certificateAuthorities[0]]; //lookup CA details from config
  if (!caInfo) throw errors.file_not_found.withDescription("Configuration Files: caInfo are missing");
  const caTLSCACerts = caInfo?.tlsCACerts?.pem;
  if (!caTLSCACerts) throw errors.file_not_found.withDescription("Configuration Files: caTLSCACerts are missing");
  const caClient = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);
  return caClient;
};

export const connectInitializeHLF = async (netServer, orgName) => {
  const ccp = buildCCPOrg(netServer, orgName);
  const caClient = buildCAClient(ccp, orgName);
  const walletDes = walletPath(orgName);
  const wallet = await (walletDes ? Wallets.newFileSystemWallet(walletDes) : Wallets.newInMemoryWallet());
  return { caClient, wallet, ccp };
};
