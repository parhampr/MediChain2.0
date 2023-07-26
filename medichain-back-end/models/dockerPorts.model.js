import mongoose, { Schema } from "mongoose";
import { dockerModelString } from "../app/constants/model/modelContants.js";
import {
  caPortAttribute,
  couchPortAttribute,
  p0PortAttribute,
  reservedAttribute,
} from "../app/constants/common/constants.js";

export const dockerPortsModel = mongoose.model(
  dockerModelString,
  new Schema(
    {
      [p0PortAttribute]: {
        type: Number,
        required: true,
        unique: true,
      },
      [caPortAttribute]: {
        type: Number,
        required: true,
        unique: true,
      },
      [couchPortAttribute]: {
        type: Number,
        required: true,
        unique: true,
      },
      [reservedAttribute]: {
        type: Boolean,
        required: true,
      },
    },
    { timestamps: true }
  )
);
