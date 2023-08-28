import { PORT_ATTRIBUTES } from "@Constant/Common";
import { Model_ATTRIBUTES } from "@Constant/Models";
import { IDockerPortsModel } from "@Interfaces/models";
import mongoose, { Schema } from "mongoose";

export const dockerPortsModel = mongoose.model<IDockerPortsModel>(
  Model_ATTRIBUTES.DockerModel,
  new Schema<IDockerPortsModel>(
    {
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
    },
    { timestamps: true },
  ),
);
