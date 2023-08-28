import { PORT_ATTRIBUTES } from "../app/constants/Common";
import { Model_ATTRIBUTES } from "../app/constants/Models";
import mongoose, { Schema } from "mongoose";
export const dockerPortsModel = mongoose.model(Model_ATTRIBUTES.DockerModel, new Schema({
    [PORT_ATTRIBUTES.p0Port]: {
        type: Number,
        required: true,
        unique: true,
    },
    [PORT_ATTRIBUTES.caPort]: {
        type: Number,
        required: true,
        unique: true,
    },
    [PORT_ATTRIBUTES.couchPort]: {
        type: Number,
        required: true,
        unique: true,
    },
    [PORT_ATTRIBUTES.reserved]: {
        type: Boolean,
        required: true,
    },
}, { timestamps: true }));
//# sourceMappingURL=dockerports.js.map