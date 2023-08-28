import { TOKEN_ATTRIBUTES } from "../app/configs/Defaults";
import Environment from "../app/configs/Environment";
import { Model_ATTRIBUTES } from "../app/constants/Models";
import { ApiError, errResponse, otherErrResponse } from "../errors/ApiError";
import errors from "../errors/GenericErrors";
import { UsersModel } from "../models/users";
import utils from "../app/utilities/utils";
import jwt from "jsonwebtoken";
class AuthController {
    async login(req, res) {
        try {
            const { userId, password, type } = req.body;
            if (!userId || !password || !type)
                return res.status(400).json(errResponse(errors.not_found, "Username, Password and Type are required"));
            const foundUser = await UsersModel.findOne({ userId }).populate(Model_ATTRIBUTES.associatedOrganizationPropForUser);
            if (!foundUser)
                return res.status(404).json(errResponse(errors.unauthorized_access, "Username and/or Password was not found"));
            const isPasswordMatch = await foundUser.comparePassword(userId, password);
            if (!isPasswordMatch)
                throw errors.invalid_auth.withDescription("Username and/or Password is incorrect");
            const isTypeMatch = await foundUser.compareType(password, type);
            if (!isTypeMatch)
                throw errors.invalid_auth.withDescription(`Username and/or Password is incorrect for type: ${type.charAt(0).toUpperCase() + type.slice(1)}`);
            const { fullName: organization, nameId: orgId } = foundUser.associatedOrganization || {};
            const user = { userId, type, organization, orgId };
            const accessToken = utils.signJWTToken(user, Environment.ACCESS_TOKEN_SECRET, TOKEN_ATTRIBUTES.aTokenExpiresIn);
            const refreshToken = utils.signJWTToken(user, Environment.REFRESH_ACCESS_TOKEN_SECRET, TOKEN_ATTRIBUTES.rTokenExpiresIn);
            await UsersModel.findOneAndUpdate({ userId }, { refreshToken });
            res.cookie("jwt", refreshToken, { httpOnly: true, maxAge: TOKEN_ATTRIBUTES.cookieMaxAge });
            return res.status(200).json({ user, accessToken });
        }
        catch (err) {
            return err instanceof ApiError
                ? res.status(err.status).json(errResponse(err))
                : res.status(500).json(otherErrResponse(err));
        }
    }
    async refreshLogin(req, res) {
        try {
            const { jwt: refreshToken } = req.cookies;
            if (!refreshToken)
                return res
                    .status(401)
                    .json(errResponse(errors.unauthorized_access, "Please authorize yourself before requesting again"));
            const foundUser = await UsersModel.findOne({ refreshToken });
            if (!foundUser)
                return res.status(403).json(errResponse(errors.forbidden_access, "You are not allowed to complete this request"));
            return jwt.verify(refreshToken, Environment.REFRESH_ACCESS_TOKEN_SECRET, (err, user) => {
                if (err || user.userId !== foundUser.userId) {
                    return res.status(403).json(errResponse(errors.forbidden_access, "You are not allowed to complete this request"));
                }
                const { exp, iat, ...otherPayload } = user;
                const accessToken = utils.signJWTToken(otherPayload, Environment.ACCESS_TOKEN_SECRET, TOKEN_ATTRIBUTES.aTokenExpiresIn);
                return res.status(200).json({ accessToken });
            });
        }
        catch (err) {
            return err instanceof ApiError
                ? res.status(err.status).json(errResponse(err))
                : res.status(500).json(otherErrResponse(err));
        }
    }
    async logout(req, res) {
        try {
            const { jwt: refreshToken } = req.cookies;
            // If no cookie, it's okay because our aim is to delete it anyway.
            if (!refreshToken)
                return res.sendStatus(204);
            const foundUser = await UsersModel.findOne({ refreshToken });
            if (!foundUser) {
                res.clearCookie("jwt", { httpOnly: true });
                return res.sendStatus(204);
            }
            await UsersModel.findOneAndUpdate({ refreshToken }, { refreshToken: null });
            res.clearCookie("jwt", { httpOnly: true });
            return res.sendStatus(204);
        }
        catch (err) {
            return err instanceof ApiError
                ? res.status(err.status).json(errResponse(err))
                : res.status(500).json(otherErrResponse(err));
        }
    }
}
export default new AuthController();
//# sourceMappingURL=AuthController.js.map