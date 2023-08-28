import { Model_ATTRIBUTES } from "../app/constants/Models";
import { hashUserModelUsersBefore } from "../middlewares/modelPreSave";
import bcrypt from "bcrypt";
import mongoose, { Schema } from "mongoose";
const userSchemaProperties = new Schema({
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
}, { timestamps: true });
userSchemaProperties.pre("save", hashUserModelUsersBefore);
userSchemaProperties.methods.comparePassword = function (sentUserId, sentPassword) {
    return bcrypt.compare(`${sentPassword}@${sentUserId}`, this.password);
};
userSchemaProperties.methods.compareType = function (sentPassword, sentType) {
    return bcrypt.compare(`${sentPassword}@${sentType}`, this.type);
};
export const UsersModel = mongoose.model(Model_ATTRIBUTES.UserModel, userSchemaProperties);
//# sourceMappingURL=users.js.map