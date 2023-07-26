import { errResponse } from "../app/error/apiError.class.js";
import errors from "../app/error/genericErrors.js";
import { verify as verifyJWT } from "jsonwebtoken";
import { accessTokenSecret } from "../app/constants/config/env.js";
import { superAdminType } from "../app/constants/config/userRoles.js";
import { AuthorizationHeaderTypeConstant } from "../app/constants/config/defaults.js";

export const verifyJwtToken = (req, res, next) => {
  const authHeader = req.headers[AuthorizationHeaderTypeConstant];
  if (!authHeader)
    return res
      .status(401)
      .json(errResponse(errors.unauthorized_access, "Please authorize yourself before requesting again"));
  const authToken = authHeader.split(" ")[1];
  verifyJWT(authToken, accessTokenSecret, (_, user) => {
    if (!user)
      return res.status(403).json(errResponse(errors.forbidden_access, "You are not allowed to complete this request"));
    req.user = user;
    next();
  });
};

export const checkForSuperAdminUser = (req, res, next) =>
  req.user.type === superAdminType
    ? next()
    : res.status(403).json(errResponse(errors.forbidden_access, "Only SuperAdmin is allowed to make this request"));
