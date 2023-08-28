import { AUTH_HEADER_KEY } from "@Config/Defaults";
import { errResponse } from "@Error/ApiError";
import errors from "@Error/GenericErrors";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import Environment from "@Config/Environment";
import { ROLE } from "@Constant/Common";

export const verifyJwtToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers[AUTH_HEADER_KEY];
  if (!authHeader)
    res.status(401).json(errResponse(errors.unauthorized_access, "Please authorize yourself before requesting again"));
  else {
    const authToken = authHeader.split(" ")[1];
    jwt.verify(authToken, Environment.ACCESS_TOKEN_SECRET, (_err, user) => {
      if (!user) res.status(403).json(errResponse(errors.forbidden_access, "You are not allowed to complete this request"));
      else {
        req["user"] = user;
        next();
      }
    });
  }
};

export const checkForSuperAdminUser = (req: Request, res: Response, next: NextFunction) =>
  req["user"].type === ROLE.superAdmin
    ? next()
    : res.status(403).json(errResponse(errors.forbidden_access, "Only SuperAdmin is allowed to make this request"));
