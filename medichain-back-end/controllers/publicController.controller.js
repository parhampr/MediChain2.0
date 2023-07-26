"use strict";

import { errResponse, otherErrResponse } from "../app/error/apiError.class.js";
import errors from "../app/error/genericErrors.js";
import { organizationModel } from "../models/organization.model.js";

export const getAllEnrolledOrganizations = async (_, res) => {
  try {
    const organisations = await organizationModel.find({ enrolled: true });
    const retrivedData = organisations.map(({ nameId, fullName }) => ({
      value: `${nameId} - ${fullName}`,
      label: fullName,
    }));
    return res.status(200).json(retrivedData);
  } catch (err) {
    if (err?.name === "CastError")
      return res.status(400).json(errResponse(errors.bad_input, `The netId/orgId is not valid or not correct`));
    return res.status(500).json(otherErrResponse(err));
  }
};
