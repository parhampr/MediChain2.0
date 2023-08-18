import {
  AlternateEmail,
  AssistantPhoto,
  ContactPhone,
  ExpandCircleDown,
  FmdGood,
  Grid3x3,
  LocationCity,
  Lock,
  PermPhoneMsg,
  Phone,
  Signpost,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { IconButton, InputAdornment, Tooltip, Typography } from "@mui/material";
import { departmentSelectOptions, genderStatus, maritalStatus } from "../common/utils/formSelectOptions";
import CountryCity from "countrycitystatejson";
import { subYears } from "date-fns";
import { ROLE } from "../common/constants/userProperties";
import { useGetEnrolledHospitalsQuery } from "../features/auth/authApiSlice";

export const signUpFormConfig = (TYPE) => [
  {
    id: "signupDetails",
    title: "Account Signup Details",
    description:
      "The information listed in this section will be used to register into the account. The userID is Passport Number.",
    borderRadius: () => "12px 12px 0 0",
    icon: <ExpandCircleDown sx={{ color: "text.primary" }} />,
    defaultOpen: true,
    renderFields: ["userId", "password", "hospOrg"],
    requiredFields: ["userId", "password", "hospOrg"],
    fields: [
      {
        uid: "userId",
        type: "TextField",
        gridProps: {
          item: true,
          xs: 12,
          md: 6,
        },
        fieldProps: {
          autoFocus: true,
          name: "userId",
          id: "userId",
          type: "text",
          label: "NRIC/Passport No. *",
          placeholder: "123456-78-GB02",
          helperText:
            "Only digits and alphabets, including hyphens for NRIC numbers, can be found in a legitimate NRIC/Passport number.",
          autoComplete: "username",
          InputProps: {
            startAdornment: (
              <InputAdornment position="start">
                <Grid3x3 sx={{ color: "text.primary" }} />
              </InputAdornment>
            ),
          },
        },
      },
      {
        uid: "password",
        type: "TextField",
        gridProps: {
          item: true,
          xs: 12,
          md: 6,
        },
        fieldProps: {
          name: "password",
          id: "password",
          label: "Password *",
          type: "password",
          placeholder: "Strong12_Pass$%word",
          helperText:
            "A valid password must have at least 8 characters, including at least one number, one special character, one uppercase character, one lowercase character, and one dot character.",
          autoComplete: "new-password",
          InputProps: {
            startAdornment: (
              <InputAdornment position="start">
                <Lock sx={{ color: "text.primary" }} />
              </InputAdornment>
            ),
          },
        },
        extraArgs: {
          endAdornment: (pwVisible, setPwVisible) => (
            <InputAdornment position="end">
              <Tooltip title={pwVisible ? "Hide Password" : "Show Password"}>
                <IconButton onClick={setPwVisible} sx={{ color: "text.primary" }}>
                  {pwVisible ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </Tooltip>
            </InputAdornment>
          ),
        },
      },
      {
        uid: "hospOrg",
        type: "Select",
        gridProps: {
          item: true,
          xs: 12,
        },
        fieldProps: {
          name: "hospOrg",
          label: "Hospital Organization *",
          labelId: "hospital-org-select-helper",
          id: "hospOrg",
        },
        extraArgs: {
          helperText:
            "Select the name of the facility you want to add to the record. Please get in touch with the hospital as quickly as possible if you are unable to locate your hospital.",
          label: "Hospital Organization *",
          labelId: "hospital-org-select-helper",
          emptyValue: "",
          defaultValue: "",
          emptySelectPlaceholder: "Please Select",
          options: {
            dataFromQuery: useGetEnrolledHospitalsQuery,
          },
          controlledArgs: (value, onChangeValue) => ({ value, onChange: onChangeValue }),
        },
      },
    ],
  },
  {
    id: "personalDetails",
    title: "Personal Details",
    description:
      "To establish a new patient account, personal information is necessary. The accuracy of these specifics is anticipated to be as high as feasible.",
    borderRadius: (isOpen) => (isOpen ? "12px 12px 0 0" : 0),
    icon: <ExpandCircleDown sx={{ color: "text.primary" }} />,
    renderFields: [
      "firstName",
      "middleName",
      "lastName",
      "email",
      "DOB",
      "gender",
      "maritalStatus",
      TYPE === ROLE.DOCTOR ? "department" : null,
    ],
    requiredFields: [
      "firstName",
      "lastName",
      "email",
      "DOB",
      "gender",
      "maritalStatus",
      TYPE === ROLE.DOCTOR ? "department" : null,
    ],
    fields: [
      {
        uid: "firstName",
        type: "TextField",
        gridProps: {
          item: true,
          xs: 12,
          md: 4,
        },
        fieldProps: {
          name: "firstName",
          label: "First Name *",
          placeholder: "Nicole",
          type: "text",
          id: "firstName",
          helperText: "A first name must have at least three alphabetic characters to be considered legitimate.",
          autoComplete: "given-name",
          InputProps: {
            startAdornment: (
              <InputAdornment position="start">
                <Typography sx={{ color: "text.primary", fontSize: "18px" }}>
                  <b>F</b>
                </Typography>
              </InputAdornment>
            ),
          },
        },
      },
      {
        uid: "middleName",
        type: "TextField",
        gridProps: {
          item: true,
          xs: 12,
          md: 4,
        },
        fieldProps: {
          label: "Middle Name",
          placeholder: "Wang",
          type: "text",
          id: "middleName",
          helperText: "A middle name must have at least 0-3 alphabetic letters to be considered legal",
          autoComplete: "additional-name",
          InputProps: {
            startAdornment: (
              <InputAdornment position="start">
                <Typography sx={{ color: "text.primary", fontSize: "18px" }}>
                  <b>M</b>
                </Typography>
              </InputAdornment>
            ),
          },
        },
      },
      {
        uid: "lastName",
        type: "TextField",
        gridProps: {
          item: true,
          xs: 12,
          md: 4,
        },
        fieldProps: {
          name: "lastName",
          label: "Family/Last Name *",
          placeholder: "Sew",
          type: "text",
          id: "lastName",
          helperText: "A last name must have at least 0-3 alphabetic letters to be considered legal. This is optional.",
          autoComplete: "family-name",
          InputProps: {
            startAdornment: (
              <InputAdornment position="start">
                <Typography sx={{ color: "text.primary", fontSize: "18px" }}>
                  <b>L</b>
                </Typography>
              </InputAdornment>
            ),
          },
        },
      },
      {
        uid: "email",
        type: "TextField",
        gridProps: {
          item: true,
          xs: 12,
        },
        fieldProps: {
          name: "email",
          label: "Email Address *",
          placeholder: "nicole23@domain.com",
          type: "text",
          id: "email",
          helperText: "A minimum of 7 characters, including the site name and ID, make up an email.",
          autoComplete: "email",
          InputProps: {
            startAdornment: (
              <InputAdornment position="start">
                <AlternateEmail sx={{ color: "text.primary" }} />
              </InputAdornment>
            ),
          },
        },
      },
      {
        uid: "DOB",
        type: "DatePicker",
        gridProps: {
          item: true,
          xs: 12,
          md: 4,
        },
        fieldProps: {
          label: "Date of Birth *",
          maxDate: new Date().getTime(),
        },
        textFieldProps: {
          name: "DOB",
          id: "DOB",
          helperText: "Please enter your correct birth date using the following format: DD/MM/YYYY.",
          autoComplete: "bday",
        },

        extraArgs: {
          defaultValue: subYears(new Date(), 18).getTime(),
          controlledArgs: (value, onChange) => ({ value, onChange }),
        },
      },
      {
        uid: "gender",
        type: "Select",
        gridProps: {
          item: true,
          xs: 12,
          md: 4,
        },
        fieldProps: {
          name: "gender",
          label: "Gender *",
          labelId: "gender-select-helper",
          id: "gender",
        },
        extraArgs: {
          helperText: "Kindly enter your gender for record.",
          label: "Gender *",
          labelId: "gender-select-helper",
          emptyValue: "",
          defaultValue: "",
          emptySelectPlaceholder: "Please Select",
          options: {
            defaultData: genderStatus,
          },
          controlledArgs: (value, onChangeValue) => ({ value, onChange: onChangeValue }),
        },
      },
      {
        uid: "maritalStatus",
        type: "Select",
        gridProps: {
          item: true,
          xs: 12,
          md: 4,
        },
        fieldProps: {
          name: "maritalStatus",
          label: "Marital Status *",
          labelId: "marital-status-select-helper",
          id: "maritalStatus",
        },
        extraArgs: {
          helperText: "Kindly enter your marital status for record.",
          label: "Marital Status *",
          labelId: "marital-status-select-helper",
          emptyValue: "",
          defaultValue: "",
          emptySelectPlaceholder: "Please Select",
          options: {
            defaultData: maritalStatus,
          },
          controlledArgs: (value, onChangeValue) => ({ value, onChange: onChangeValue }),
        },
      },
      {
        uid: "department",
        type: "Select",
        gridProps: {
          item: true,
          xs: 12,
        },
        fieldProps: {
          name: "department",
          label: "Department *",
          labelId: "department-select-helper",
          id: "department",
        },
        extraArgs: {
          helperText:
            "Please enter the hospital area in which you specialize. If you are having trouble finding your department, please get in touch with the hospital right away.",
          label: "Department *",
          labelId: "department-select-helper",
          emptyValue: "",
          defaultValue: "",
          emptySelectPlaceholder: "Please Select",
          options: {
            defaultData: departmentSelectOptions,
          },
          controlledArgs: (value, onChangeValue) => ({ value, onChange: onChangeValue }),
        },
      },
    ],
  },
  {
    id: "locationDetails",
    title: "Location Details",
    description: "For the advantage of the patient, the hospital needs to know the location information.",
    borderRadius: (isOpen) => (isOpen ? "12px 12px 0 0" : 0),
    icon: <ExpandCircleDown sx={{ color: "text.primary" }} />,
    renderFields: ["street1", "street2", "countrystate", "city", "postcode"],
    requiredFields: ["street1", "country", "state", "city", "postcode"],
    fields: [
      {
        uid: "street1",
        type: "TextField",
        gridProps: {
          item: true,
          xs: 12,
        },
        fieldProps: {
          name: "street1",
          id: "street1",
          label: "Location Address 1 *",
          placeholder: "Street 1, Col 1",

          helperText: "Please enter the street line address 1 for the record",
          type: "text",
          autoComplete: "address-line1",
          InputProps: {
            startAdornment: (
              <InputAdornment position="start">
                <FmdGood sx={{ color: "text.primary" }} />
              </InputAdornment>
            ),
          },
        },
      },
      {
        uid: "street2",
        type: "TextField",
        gridProps: {
          item: true,
          xs: 12,
        },
        fieldProps: {
          name: "street2",
          id: "street2",
          label: "Location Address 2",
          placeholder: "Street 2",

          helperText: "Please enter the street line address 2 for the record. This is optional",
          type: "text",
          autoComplete: "address-line1",
          InputProps: {
            startAdornment: (
              <InputAdornment position="start">
                <FmdGood sx={{ color: "text.primary" }} />
              </InputAdornment>
            ),
          },
        },
      },
      {
        uid: "countrystate",
        type: "Autocomplete",
        autoFields: [
          {
            uid: "country",
            gridProps: {
              item: true,
              xs: 12,
              md: 6,
            },
            fieldProps: {
              id: "country-select",
              options: () => CountryCity.getCountries(),
              autoHighlight: true,
              sx: { mt: 2 },
              getOptionLabel: (option) => option.name,
              isOptionEqualToValue: (option, value) => option.name === value.name,
              renderOption: (props, option) => (
                <li {...props}>
                  <img
                    loading="lazy"
                    width="20"
                    src={`https://flagcdn.com/w20/${option.shortName.toLowerCase()}.png`}
                    srcSet={`https://flagcdn.com/w40/${option.shortName.toLowerCase()}.png 2x`}
                    alt=""
                    style={{ marginRight: "16px", flexShrink: 0 }}
                  />
                  {option.name} ({option.shortName})
                </li>
              ),
            },

            textFieldProps: {
              label: "Choose a country *",
              helperText: "Please select a country from the list",
              name: "country",
              id: "country",
            },

            textFieldInputProps: {
              autoComplete: "new-password",
              startAdornment: (
                <InputAdornment position="start">
                  <AssistantPhoto sx={{ color: "text.primary" }} />
                </InputAdornment>
              ),
            },

            extraArgs: {
              onChange: (uid, onChangeFn) => (_, value) =>
                onChangeFn(uid, value ? `${value.name} (${value.shortName})` : null),
              disabledFn: () => false,
            },
          },
          {
            uid: "state",
            gridProps: {
              item: true,
              xs: 12,
              md: 6,
            },
            fieldProps: {
              id: "state-select",
              options: ({ country }) =>
                country ? CountryCity.getStatesByShort(country.split("(")[1].slice(0, -1)) : [],
              autoHighlight: true,
              sx: { mt: 2 },
              getOptionLabel: (option) => option,
              renderOption: (props, option) => <li {...props}>{option}</li>,
            },

            textFieldProps: {
              label: "Choose a State/Province *",
              helperText: "Please select a valid state/province from the list after you have selected your country",
              name: "state",
              id: "state",
            },

            textFieldInputProps: {
              autoComplete: "new-password",
              startAdornment: (
                <InputAdornment position="start">
                  <LocationCity sx={{ color: "text.primary" }} />
                </InputAdornment>
              ),
            },

            extraArgs: {
              onChange: (uid, onChangeFn) => (_, value) => onChangeFn(uid, value),
              disabledFn: ({ country }) => !Boolean(country),
            },
          },
        ],
      },
      {
        uid: "city",
        type: "TextField",
        gridProps: {
          item: true,
          xs: 12,
          md: 6,
        },
        fieldProps: {
          name: "city",
          id: "city",
          label: "City *",
          placeholder: "High Sky City",

          helperText: "A valid location (City) contains only alphabets and spaces",
          type: "text",
          autoComplete: "new-password",
          InputProps: {
            startAdornment: (
              <InputAdornment position="start">
                <FmdGood sx={{ color: "text.primary" }} />
              </InputAdornment>
            ),
          },
        },
      },
      {
        uid: "postcode",
        type: "TextField",
        gridProps: {
          item: true,
          xs: 12,
          md: 6,
        },
        fieldProps: {
          name: "postcode",
          id: "postcode",
          label: "Postal Code *",
          placeholder: "11100",

          helperText: "Please enter a valid postal code of at least 4-6 digits",
          type: "number",
          autoComplete: "postal-code",
          InputProps: {
            startAdornment: (
              <InputAdornment position="start">
                <Signpost sx={{ color: "text.primary" }} />
              </InputAdornment>
            ),
          },
        },
      },
    ],
  },
  {
    id: "contactDetails",
    title: "Contact Details",
    description: "This information is required by the hospital to reach out for additional information.",
    borderRadius: (open) => (open ? "12px 12px 0 0" : "0 0 12px 12px"),
    icon: <ExpandCircleDown sx={{ color: "text.primary" }} />,
    renderFields: ["mobile", "whatsapp", "other"],
    requiredFields: ["mobile"],
    fields: [
      {
        uid: "mobile",
        type: "TextField",
        gridProps: {
          item: true,
          xs: 12,
          md: 6,
        },
        fieldProps: {
          name: "mobile",
          id: "mobile",
          type: "tel",
          label: "Mobile Number *",
          placeholder: "+(CO)1XXXXXXX...",
          helperText:
            "The chosen country determines whether a phone number is valid. Enter all required criteria, including the country number.",
          autoComplete: "tel",
          InputProps: {
            startAdornment: (
              <InputAdornment position="start">
                <Phone sx={{ color: "text.primary" }} />
              </InputAdornment>
            ),
          },
        },
      },
      {
        uid: "whatsapp",
        shouldRender: () => true,
        type: "TextField",
        gridProps: {
          item: true,
          xs: 12,
          md: 6,
        },
        fieldProps: {
          name: "whatsapp",
          id: "whatsapp",
          type: "tel",
          label: "Whatsapp Number For Easier Access",
          placeholder: "+(CO)1XXXXXXX...",
          helperText:
            "The chosen country determines whether a whatsapp number is valid. Enter all required criteria, including the country number.",
          autoComplete: "tel",
          InputProps: {
            startAdornment: (
              <InputAdornment position="start">
                <PermPhoneMsg sx={{ color: "text.primary" }} />
              </InputAdornment>
            ),
          },
        },
      },
      {
        uid: "other",
        shouldRender: () => true,
        type: "TextField",
        gridProps: {
          item: true,
          xs: 12,
        },
        fieldProps: {
          name: "other",
          id: "other",
          type: "tel",
          label: "Additional Other Number as an alternative, if any",
          placeholder: "+(CO)1XXXXXXX...",
          helperText:
            "The chosen country determines whether a phone number is valid. Enter all required criteria, including the country number.",
          autoComplete: "tel",
          InputProps: {
            startAdornment: (
              <InputAdornment position="start">
                <ContactPhone sx={{ color: "text.primary" }} />
              </InputAdornment>
            ),
          },
        },
      },
    ],
  },
];

export const errorConfig = {
  signupDetails: {
    accordionError: false,
    fields: {
      userId: false,
      password: false,
      hospOrg: false,
    },
  },
  personalDetails: {
    accordionError: false,
    fields: {
      firstName: false,
      lastName: false,
      email: false,
      DOB: false,
      gender: false,
      maritalStatus: false,
      department: false,
    },
  },
  locationDetails: {
    accordionError: false,
    fields: {
      street1: false,
      country: false,
      state: false,
      city: false,
      postcode: false,
    },
  },
  contactDetails: {
    accordionError: false,
    fields: { mobile: false },
  },
};
