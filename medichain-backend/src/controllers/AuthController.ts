import { TOKEN_ATTRIBUTES } from "@Config/Defaults";
import Environment from "@Config/Environment";
import { Model_ATTRIBUTES } from "@Constant/Models";
import { ApiError, errResponse, otherErrResponse } from "@Error/ApiError";
import errors from "@Error/GenericErrors";
import { IOrganization } from "@Interfaces/models";
import { UsersModel } from "@Model/users";
import utils from "@Utilities/utils";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";

class AuthController {
  public async login(req: Request, res: Response): Promise<Response> {
    try {
      const { userId, password, type } = req.body as { userId: string; password: string; type: string };

      if (!userId || !password || !type)
        return res.status(400).json(errResponse(errors.not_found, "Username, Password and Type are required"));

      const foundUser = await UsersModel.findOne({ userId }).populate<{ associatedOrganization: IOrganization }>(
        Model_ATTRIBUTES.associatedOrganizationPropForUser,
      );
      if (!foundUser)
        return res.status(404).json(errResponse(errors.unauthorized_access, "Username and/or Password was not found"));

      const isPasswordMatch = await foundUser.comparePassword(userId, password);
      if (!isPasswordMatch) throw errors.invalid_auth.withDescription("Username and/or Password is incorrect");

      const isTypeMatch = await foundUser.compareType(password, type);
      if (!isTypeMatch)
        throw errors.invalid_auth.withDescription(
          `Username and/or Password is incorrect for type: ${type.charAt(0).toUpperCase() + type.slice(1)}`,
        );

      const { fullName: organization, nameId: orgId } = foundUser.associatedOrganization || {};
      const user = { userId, type, organization, orgId };
      const accessToken = utils.signJWTToken(user, Environment.ACCESS_TOKEN_SECRET, TOKEN_ATTRIBUTES.aTokenExpiresIn);
      const refreshToken = utils.signJWTToken(
        user,
        Environment.REFRESH_ACCESS_TOKEN_SECRET,
        TOKEN_ATTRIBUTES.rTokenExpiresIn,
      );

      await UsersModel.findOneAndUpdate({ userId }, { refreshToken });
      res.cookie("jwt", refreshToken, { httpOnly: true, maxAge: TOKEN_ATTRIBUTES.cookieMaxAge });
      return res.status(200).json({ user, accessToken });
    } catch (err) {
      return err instanceof ApiError
        ? res.status(err.status).json(errResponse(err))
        : res.status(500).json(otherErrResponse(err));
    }
  }

  public async refreshLogin(req: Request, res: Response): Promise<Response | void> {
    try {
      const { jwt: refreshToken } = req.cookies;

      if (!refreshToken)
        return res
          .status(401)
          .json(errResponse(errors.unauthorized_access, "Please authorize yourself before requesting again"));

      const foundUser = await UsersModel.findOne({ refreshToken });
      if (!foundUser)
        return res.status(403).json(errResponse(errors.forbidden_access, "You are not allowed to complete this request"));

      return jwt.verify(refreshToken, Environment.REFRESH_ACCESS_TOKEN_SECRET, (err: unknown, user: any) => {
        if (err || user.userId !== foundUser.userId) {
          return res.status(403).json(errResponse(errors.forbidden_access, "You are not allowed to complete this request"));
        }

        const { exp, iat, ...otherPayload } = user;
        const accessToken = utils.signJWTToken(
          otherPayload,
          Environment.ACCESS_TOKEN_SECRET,
          TOKEN_ATTRIBUTES.aTokenExpiresIn,
        );
        return res.status(200).json({ accessToken });
      });
    } catch (err) {
      return err instanceof ApiError
        ? res.status(err.status).json(errResponse(err))
        : res.status(500).json(otherErrResponse(err));
    }
  }

  public async logout(req: Request, res: Response): Promise<Response> {
    try {
      const { jwt: refreshToken } = req.cookies;

      // If no cookie, it's okay because our aim is to delete it anyway.
      if (!refreshToken) return res.sendStatus(204);

      const foundUser = await UsersModel.findOne({ refreshToken });
      if (!foundUser) {
        res.clearCookie("jwt", { httpOnly: true });
        return res.sendStatus(204);
      }

      await UsersModel.findOneAndUpdate({ refreshToken }, { refreshToken: null });
      res.clearCookie("jwt", { httpOnly: true });
      return res.sendStatus(204);
    } catch (err) {
      return err instanceof ApiError
        ? res.status(err.status).json(errResponse(err))
        : res.status(500).json(otherErrResponse(err));
    }
  }
}

export default new AuthController();
