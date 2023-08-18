import {
  AlternateEmail,
  AssistantPhoto,
  DriveFileRenameOutline,
  ExpandCircleDown,
  FmdGood,
  Grid3x3,
  LocationCity,
  Lock,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { IconButton, InputAdornment, Tooltip } from "@mui/material";
import CountryCity from "countrycitystatejson";

export const createOrganizationConfig = [
  {
    id: "networkDetails",
    title: "Hospital Organization Details",
    description:
      "The hospital organization details helps determine and create the Certification Authority (CA) for it's particular doctors and patients",
    borderRadius: () => "12px 12px 0 0",
    icon: <ExpandCircleDown sx={{ color: "text.primary" }} />,
    defaultOpen: true,
    renderFields: ["nameId", "fullName", "adminUserId", "adminPassword"],
    requiredFields: ["nameId", "fullName", "adminUserId", "adminPassword"],
    fields: [
      {
        uid: "nameId",
        type: "TextField",
        gridProps: {
          item: true,
          xs: 12,
          md: 6,
        },
        fieldProps: {
          autoFocus: true,
          name: "nameId",
          id: "nameId",
          type: "text",
          label: "Hospital ID *",
          placeholder: "Xenons",
          helperText: `A valid ID contains at least 5 characters with no spaces, no special characters in the beginning or end. Allowed special characters include 'underscore' and 'dot'`,
          autoComplete: "id",
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
        uid: "fullName",
        type: "TextField",
        gridProps: {
          item: true,
          xs: 12,
          md: 6,
        },
        fieldProps: {
          name: "fullName",
          id: "fullName",
          type: "text",
          label: "Hospital Organization Name *",
          placeholder: "Xenons Medical Center",
          helperText: `A valid hospital name contains only alphabets and spaces`,
          autoComplete: "id",
          InputProps: {
            startAdornment: (
              <InputAdornment position="start">
                <DriveFileRenameOutline sx={{ color: "text.primary" }} />
              </InputAdornment>
            ),
          },
        },
      },
      {
        uid: "adminUserId",
        type: "TextField",
        gridProps: {
          item: true,
          xs: 12,
          md: 6,
        },
        fieldProps: {
          name: "adminUserId",
          id: "adminUserId",
          type: "text",
          label: "Admin Username/ID *",
          placeholder: "Admin",
          helperText: `A valid username contains at least 5 characters with no spaces, no special characters in the beginning or end. Allowed special characters include 'underscore' and 'dot'`,
          autoComplete: "username",
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
        uid: "adminPassword",
        type: "TextField",
        gridProps: {
          item: true,
          xs: 12,
          md: 6,
        },
        fieldProps: {
          name: "adminPassword",
          id: "adminPassword",
          type: "password",
          label: "Admin Password *",
          placeholder: "Type your password here...",
          helperText: `A valid username contains at least 8 characters with 1 uppercase character, 1 lowercase character, 1 special character and 1 digit with no restrictions on dot character`,
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
    ],
  },
  {
    id: "locationDetails",
    title: "Hospital Location Details",
    description:
      "The hospital location details helps determine the valid permission control over the records for it's particular doctors and patients while exchanging records between hospitals",
    borderRadius: (open) => (open ? "12px 12px 0 0" : "0 0 12px 12px"),
    icon: <ExpandCircleDown sx={{ color: "text.primary" }} />,
    defaultOpen: true,
    renderFields: ["countrystate", "city"],
    requiredFields: ["country", "state", "city"],
    fields: [
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
    ],
  },
];

export const createOrganizationErrorConfig = {
  networkDetails: {
    accordionError: false,
    fields: {
      nameId: false,
      fullName: false,
      adminUserId: false,
      adminPassword: false,
    },
  },
  locationDetails: {
    accordionError: false,
    fields: {
      country: false,
      state: false,
      city: false,
    },
  },
};
