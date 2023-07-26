"use strict";
import { caPortAttribute, couchPortAttribute, p0PortAttribute } from "../app/constants/common/constants.js";
import { getHashFor } from "../app/utils/utilsFns.js";
import errors from "../app/error/genericErrors.js";
import { dockerPortsModel } from "../models/dockerPorts.model.js";

const docFunctions = {
  async hashUserModelUsersBefore(next) {
    const { userId, password, type } = this;
    await getHashFor(`${password}@${type}`)
      .then((hash) => {
        this.type = hash;
        return getHashFor(`${password}@${userId}`);
      })
      .then((hash) => {
        this.password = hash;
        return next();
      })
      .catch((err) => next(err));
  },

  async limitReachedByOrganizationModelForOrganization(next) {
    var doc = this;
    // To limit the use of ports to 3
    try {
      const availablePort = await dockerPortsModel.findOne({ reserved: false });
      if (!availablePort) return next(errors.maximum_organization_limit);
      doc.p0Port = availablePort[p0PortAttribute];
      doc.caPort = availablePort[caPortAttribute];
      doc.couchPort = availablePort[couchPortAttribute];
      next();
    } catch (err) {
      next(err);
    }
  },
};
export const { hashUserModelUsersBefore, limitReachedByOrganizationModelForOrganization } = docFunctions;
