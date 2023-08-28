import { Model_ATTRIBUTES } from "@Constant/Models";
import { IUser } from "@Interfaces/models";
import { hashUserModelUsersBefore } from "@Middleware/modelPreSave";
import bcrypt from "bcrypt";
import mongoose, { Schema } from "mongoose";

const userSchemaProperties: Schema<IUser> = new Schema(
  {
    userId: { type: String, required: true, index: { unique: true } },
    password: { type: String, required: true },
    type: { type: String, required: true },
    [Model_ATTRIBUTES.associatedOrganizationPropForUser]: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Model_ATTRIBUTES.OrganizationModel,
      default: null,
    },
    isAlternatePassword: { type: Boolean, default: false },
    refreshToken: { type: String, default: null },
  },
  { timestamps: true },
);

userSchemaProperties.pre("save", hashUserModelUsersBefore);
userSchemaProperties.methods.comparePassword = function (sentUserId: string, sentPassword: string): Promise<boolean> {
  return bcrypt.compare(`${sentPassword}@${sentUserId}`, this.password);
};
userSchemaProperties.methods.compareType = function (sentPassword: string, sentType: string): Promise<boolean> {
  return bcrypt.compare(`${sentPassword}@${sentType}`, this.type);
};

export const UsersModel = mongoose.model<IUser>(Model_ATTRIBUTES.UserModel, userSchemaProperties);
