import bcrypt from "bcrypt";
import mongoose, { Schema } from "mongoose";
import { organizationModelString, usersModelString } from "../app/constants/model/modelContants.js";
import { hashUserModelUsersBefore } from "../middleware/modelPreSave.js";

const userSchemaProperties = new Schema(
  {
    userId: { type: String, required: true, index: { unique: true } },
    password: { type: String, required: true },
    type: { type: String, required: true }, // 'superadmin' | 'admin' | 'patient' | 'doctor'
    associatedOrganization: { type: mongoose.Schema.Types.ObjectId, ref: organizationModelString, default: null },
    isAlternatePassword: { type: Boolean, default: false }, // Check if login was done on behalf of someone,
    refreshToken: { type: String, default: null },
  },
  { timestamps: true }
);

userSchemaProperties.pre("save", hashUserModelUsersBefore);
userSchemaProperties.methods.comparePassword = function (sentUserId, sentPassword) {
  return bcrypt.compare(`${sentPassword}@${sentUserId}`, this.password);
};
userSchemaProperties.methods.compareType = function (sentPassword, sentType) {
  return bcrypt.compare(`${sentPassword}@${sentType}`, this.type);
};

export const UsersModel = mongoose.model(usersModelString, userSchemaProperties);
