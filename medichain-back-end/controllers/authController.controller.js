"use strict";
import { ApiError, errResponse, otherErrResponse } from "../app/error/apiError.class.js";
import errors from "../app/error/genericErrors.js";
import { UsersModel } from "../models/users.model.js";
import jwt from "jsonwebtoken";
import { accessTokenSecret, refreshTokenSecret } from "../app/constants/config/env.js";
import { accessTokenExpiresIn, cookieMaxAge, refreshTokenExpiresIn } from "../app/constants/config/defaults.js";
import { signJwtToken } from "../app/utils/utilsFns.js";

/**
 *
 * @param {{userId, password, type}} req
 * @param {*} res
 * @returns {{user: { userId, type, organization, orgId }, accessToken} | {HTTP, MESSAGE, DESCRIPTION}}
 */
export const handleLoginForUser = async (req, res) => {
  const { userId, password, type } = req.body;
  let user, accessToken, refreshToken;
  if (!userId || !password || !type) {
    return res.status(400).json(errResponse(errors.not_found, "Username, Password and Type is required"));
  }

  const foundUser = await UsersModel.findOne({ userId }).populate("associatedOrganization");
  if (!foundUser)
    return res.status(401).json(errResponse(errors.unauthorized_access, "Username and/or Password was not found"));

  return await foundUser
    .comparePassword(userId, password)
    .then((isPasswordMatch) => {
      if (!isPasswordMatch) throw errors.invalid_auth.withDescription("Username and/or Password is incorrect");
      return foundUser.compareType(password, type);
    })
    .then((isTypeMatch) => {
      if (!isTypeMatch)
        throw errors.invalid_auth.withDescription(`Username and/or Password is incorrect for type: ${type}`);

      const { fullName: organization, nameId: orgId } = foundUser.associatedOrganization ?? {};
      user = { userId, type, organization, orgId };
      accessToken = signJwtToken(user, accessTokenSecret, accessTokenExpiresIn);
      refreshToken = signJwtToken(user, refreshTokenSecret, refreshTokenExpiresIn);
      return UsersModel.findOneAndUpdate({ userId }, { refreshToken }).exec();
    })
    .then(() => {
      res.cookie("jwt", refreshToken, { httpOnly: true, maxAge: cookieMaxAge });
      res.status(200).json({ user, accessToken });
      return res;
    })
    .catch((err) => res.status(err.status).json(err instanceof ApiError ? errResponse(err) : otherErrResponse(err)));
};

/**
 * @param {cookies} req
 * @param {*} res
 * @returns {{accessToken}}
 */
export const handleRefreshLoginForUser = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt)
    return res
      .status(401)
      .json(errResponse(errors.unauthorized_access, "Please authorize yourself before requesting again"));

  const refreshToken = cookies.jwt;
  const foundUser = await UsersModel.findOne({ refreshToken });
  if (!foundUser)
    return res.status(403).json(errResponse(errors.forbidden_access, "You are not allowed to complete this request"));
  jwt.verify(refreshToken, refreshTokenSecret, (err, user) => {
    if (err || user.userId !== foundUser.userId)
      return res.status(403).json(errResponse(errors.forbidden_access, "You are not allowed to complete this request"));

    const { exp, iat, ...otherPayload } = user;
    const accessToken = signJwtToken(otherPayload, accessTokenSecret, accessTokenExpiresIn);
    return res.status(200).json({ accessToken });
  });
};

/**
 *
 * @param {*} req
 * @param {*} res
 * @returns {res}
 */
export const handleLogoutForUser = async (req, res) => {
  const cookies = req.cookies;
  // Check if cookie exit -- If no then its okay cause our aim is to delete it anyway
  if (!cookies?.jwt) return res.sendStatus(204); // No Content
  const refreshToken = cookies.jwt;

  // User exists? If not then clear cookies and send back no content
  const foundUser = await UsersModel.findOne({ refreshToken });
  if (!foundUser) {
    res.clearCookie("jwt", { httpOnly: true });
    return res.sendStatus(204);
  }

  // Update the records and delete refresh token
  return await UsersModel.findOneAndUpdate({ refreshToken }, { refreshToken: null })
    .exec()
    .then(() => {
      res.clearCookie("jwt", { httpOnly: true });
      return res.sendStatus(204);
    })
    .catch((err) => {
      return res.status(err?.status ?? 500).json(otherErrResponse(err));
    });
};
