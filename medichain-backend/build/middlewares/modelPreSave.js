import { PORT_ATTRIBUTES } from "../app/constants/Common";
import { dockerPortsModel } from "../models/dockerports";
import utils from "../app/utilities/utils";
import errors from "../errors/GenericErrors";
const docFunctions = {
    async hashUserModelUsersBefore(next) {
        const { userId, password, type } = this;
        await utils
            .getHashFor(`${password}@${type}`)
            .then((hash) => {
            this.type = hash;
            return utils.getHashFor(`${password}@${userId}`);
        })
            .then((hash) => {
            this.password = hash;
            return next();
        })
            .catch((err) => next(err));
    },
    async limitReachedByOrganizationModelForOrganization(next) {
        var doc = this;
        try {
            const availablePort = await dockerPortsModel.findOne({ reserved: false });
            if (!availablePort)
                return next(errors.maximum_organization_limit);
            doc.p0Port = availablePort[PORT_ATTRIBUTES.p0Port];
            doc.caPort = availablePort[PORT_ATTRIBUTES.caPort];
            doc.couchPort = availablePort[PORT_ATTRIBUTES.couchPort];
            next();
        }
        catch (err) {
            next(err);
        }
    },
};
export const { hashUserModelUsersBefore, limitReachedByOrganizationModelForOrganization } = docFunctions;
//# sourceMappingURL=modelPreSave.js.map