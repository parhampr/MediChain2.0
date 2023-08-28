import errors from "../../errors/GenericErrors";
import ConnectHLF from "./ConnectHLF";
class NetworkInitialization {
    enrollAdmin = async (netServer, orgName) => {
        const { caClient, wallet, ccp } = await ConnectHLF.connectInitializeHLF(netServer, orgName);
        const user = ccp.organizations[orgName].adminUserId;
        const pass = ccp.organizations[orgName].adminUserPasswd;
        const orgMspId = ccp.organizations[orgName].mspid;
        // Check to see if we've already enrolled the admin user.
        if (await wallet.get(user))
            throw errors.duplicate_identity.withDescription("An identity for the admin user already exists in the wallet");
        // Enroll the admin user, and import the new identity into the wallet.
        const enrollment = await caClient.enroll({
            enrollmentID: user,
            enrollmentSecret: pass,
            attr_reqs: [{ name: "orgAdmin", optional: false }],
        });
        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: orgMspId,
            type: "X.509",
        };
        await wallet.put(user, x509Identity);
        return user;
    };
}
export default new NetworkInitialization();
//# sourceMappingURL=NetworkInitialize.js.map