import { NETWORK_STATUS } from "../app/configs/Network";
import { Model_ATTRIBUTES } from "../app/constants/Models";
import mongoose, { Schema } from "mongoose";
const networkSchema = new Schema({
    netId: {
        type: String,
        validate: {
            validator: (v) => /^(?=[a-zA-Z0-9._]{5,20}$)(?!.*[_.]{2})[^_.].*[^_.]$/.test(v),
            message: (props) => `${props.value} is not a valid network ID! A valid network ID contains atleast 5 characters with no spaces, no special characters in the beginning or end. Allowed special characters include 'underscore' and 'dot'`,
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
            message: (props) => `${props.value} is not a valid network Name! A valid network Name contains atleast 5 characters with no spaces, no special characters in the beginning or end. Allowed special characters include 'underscore' and 'dot'`,
        },
        required: [true, "Network Name cannot be empty"],
        trim: true,
        unique: true,
    },
    address: {
        type: String,
        validate: {
            validator: (v) => /^[a-vx-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/.test(v),
            message: (props) => `${props.value} is not a valid network address! For valid address please remove http|https:// and www., if any`,
        },
        required: [true, "Network Address cannot be empty"],
        trim: true,
    },
    [Model_ATTRIBUTES.associatedOrganizationPropForNetwork]: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: Model_ATTRIBUTES.OrganizationModel,
        },
    ],
    status: {
        type: Object,
        default: NETWORK_STATUS.unset,
    },
}, { timestamps: true });
export const networkModel = mongoose.model(Model_ATTRIBUTES.NetworkModel, networkSchema);
//# sourceMappingURL=network.js.map