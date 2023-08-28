import { Model_ATTRIBUTES } from "../app/constants/Models";
import { limitReachedByOrganizationModelForOrganization } from "../middlewares/modelPreSave";
import mongoose, { Schema } from "mongoose";
const organizationSchema = new Schema({
    fullName: {
        type: String,
        validate: {
            validator: (v) => /^[a-zA-z ,.'-]+$/.test(v),
            message: (props) => `${props.value} is not a valid hospital name! A valid hospital name contains only alphabets and spaces`,
        },
        required: [true, "Hospital name is required"],
        trim: true,
    },
    nameId: {
        type: String,
        validate: {
            validator: (v) => /^(?=[a-zA-Z0-9._]{2,20}$)(?!.*[_.]{2})[^_.].*[^_.]$/.test(v),
            message: (props) => `${props.value} is not a valid hospital ID! A valid hospital ID contains atleast 5 characters with no spaces, no special characters in the beginning or end. Allowed special characters include 'underscore' and 'dot'`,
        },
        required: [true, "Hospital short name (ID) is required"],
        trim: true,
        unique: true,
        index: true,
    },
    adminUserId: {
        type: String,
        validate: {
            validator: (v) => /^(?=[a-zA-Z0-9._]{5,20}$)(?!.*[_.]{2})[^_.].*[^_.]$/.test(v),
            message: (props) => `${props.value} is not a valid username! A valid username contains atleast 5 characters with no spaces, no special characters in the beginning or end. Allowed special characters include 'underscore' and 'dot'`,
        },
        required: [true, "Admin username is required"],
        unique: true,
        trim: true,
    },
    adminPassword: {
        type: String,
        validate: {
            validator: (v) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*_])(?=.{8,})/.test(v),
            message: (props) => `${props.value} is not a valid password! A valid password contains atleast 8 characters with 1 uppercase character, 1 lowercase character, 1 special character (except underscore) and 1 digit with no restrictions on dot character`,
        },
        required: [true, "Admin password is required"],
    },
    country: {
        type: String,
        validate: {
            validator: (v) => /^[a-zA-z ,.'-]+$/.test(v),
            message: (props) => `${props.value} is not a valid country! A valid country name contains only alphabets and spaces`,
        },
        required: [true, "Country is required"],
        trim: true,
    },
    state: {
        type: String,
        validate: {
            validator: (v) => /^[a-zA-z ,.'-]+$/.test(v),
            message: (props) => `${props.value} is not a valid state! A valid state name contains only alphabets and spaces`,
        },
        trim: true,
    },
    city: {
        type: String,
        validate: {
            validator: (v) => /^[a-zA-z ,.'-]+$/.test(v),
            message: (props) => `${props.value} is not a valid city! A valid city name contains only alphabets and spaces`,
        },
        trim: true,
    },
    p0Port: {
        type: Number,
        unique: true,
    },
    caPort: {
        type: Number,
        unique: true,
    },
    couchPort: {
        type: Number,
        unique: true,
    },
    enrolled: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true }).pre("save", limitReachedByOrganizationModelForOrganization);
export const organizationModel = mongoose.model(Model_ATTRIBUTES.OrganizationModel, organizationSchema);
//# sourceMappingURL=organization.js.map