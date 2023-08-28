import { AUTH_HEADER_KEY } from "../app/configs/Defaults";
import { errResponse } from "../errors/ApiError";
import errors from "../errors/GenericErrors";
import jwt from "jsonwebtoken";
import Environment from "../app/configs/Environment";
import { ROLE } from "../app/constants/Common";
export const verifyJwtToken = (req, res, next) => {
    const authHeader = req.headers[AUTH_HEADER_KEY];
    if (!authHeader)
        res.status(401).json(errResponse(errors.unauthorized_access, "Please authorize yourself before requesting again"));
    else {
        const authToken = authHeader.split(" ")[1];
        jwt.verify(authToken, Environment.ACCESS_TOKEN_SECRET, (_err, user) => {
            if (!user)
                res.status(403).json(errResponse(errors.forbidden_access, "You are not allowed to complete this request"));
            else {
                req["user"] = user;
                next();
            }
        });
    }
};
export const checkForSuperAdminUser = (req, res, next) => req["user"].type === ROLE.superAdmin
    ? next()
    : res.status(403).json(errResponse(errors.forbidden_access, "Only SuperAdmin is allowed to make this request"));
//# sourceMappingURL=authorization.js.map