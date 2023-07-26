import mongoose, { Schema } from "mongoose";
import { networkModelString, organizationModelString } from "../app/constants/model/modelContants.js";
import { networkStatus } from "../app/constants/model/networkStatusConstants.js";

export const networkModel = mongoose.model(
  networkModelString,
  new Schema(
    {
      netId: {
        type: String,
        validate: {
          validator: (v) => /^(?=[a-zA-Z0-9._]{5,20}$)(?!.*[_.]{2})[^_.].*[^_.]$/.test(v),
          message: (props) =>
            `${props.value} is not a valid network ID!\nA valid network ID contains atleast 5 characters with no spaces, no special characters in the beginning or end. \nAllowed special characters include 'underscore' and 'dot'`,
        },
        required: [true, "Network ID cannot be empty"],
        trim: true,
        index: true,
        unique: true,
      },

      name: {
        type: String,
        validate: {
          validator: (v) => /^(?=[a-zA-Z0-9._]{5,20}$)(?!.*[_.]{2})[^_.].*[^_.]$/.test(v),
          message: (props) =>
            `${props.value} is not a valid network Name!\nA valid network Name contains atleast 5 characters with no spaces, no special characters in the beginning or end. \nAllowed special characters include 'underscore' and 'dot'`,
        },
        required: [true, "Network Name cannot be empty"],
        trim: true,
        unique: true,
      },

      address: {
        type: String,
        validate: {
          validator: (v) => /^[a-vx-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/.test(v),
          message: (props) =>
            `${props.value} is not a valid network address!\nFor valid address please remove http|https:// and www., if any`,
        },
        required: [true, "Network Address cannot be empty"],
        trim: true,
      },

      associatedOrganizations: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: organizationModelString,
        },
      ],

      status: {
        type: Object,
        default: networkStatus.unset,
      },
    },
    { timestamps: true }
  )
);
