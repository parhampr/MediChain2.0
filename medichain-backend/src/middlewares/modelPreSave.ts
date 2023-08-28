import { IOrganization, IUser } from "@Interfaces/models";
import { PORT_ATTRIBUTES } from "@Constant/Common";
import { dockerPortsModel } from "@Model/dockerports";
import utils from "@Utilities/utils";
import errors from "@Error/GenericErrors";

const docFunctions = {
  async hashUserModelUsersBefore(next: Function) {
    const { userId, password, type }: IUser = this;
    await utils
      .getHashFor(`${password}@${type}`)
      .then((hash: string) => {
        this.type = hash;
        return utils.getHashFor(`${password}@${userId}`);
      })
      .then((hash: string) => {
        this.password = hash;
        return next();
      })
      .catch((err: Error) => next(err));
  },

  async limitReachedByOrganizationModelForOrganization(next: Function) {
    var doc: IOrganization = this;
    try {
      const availablePort = await dockerPortsModel.findOne({ reserved: false });
      if (!availablePort) return next(errors.maximum_organization_limit);
      doc.p0Port = availablePort[PORT_ATTRIBUTES.p0Port];
      doc.caPort = availablePort[PORT_ATTRIBUTES.caPort];
      doc.couchPort = availablePort[PORT_ATTRIBUTES.couchPort];
      next();
    } catch (err) {
      next(err);
    }
  },
};
export const { hashUserModelUsersBefore, limitReachedByOrganizationModelForOrganization } = docFunctions;
