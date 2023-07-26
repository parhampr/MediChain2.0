import { AlternateEmail, Lock, Visibility, VisibilityOff } from "@mui/icons-material";
import { IconButton, InputAdornment, Tooltip } from "@mui/material";
import { Link } from "react-router-dom";
import { signupRoute } from "../common/contants/routesConstants";
import { ADMIN, DOCTOR, PATIENT, SUPER_ADMIN } from "../common/contants/userRoles";
import { allLoginTypes } from "../common/utils/formSelectoptions";

export const loginFields = [
  {
    uid: "userId",
    gridProps: { item: true, xs: 12 },
    fieldProps: {
      required: true,
      autoFocus: true,
      name: "userId",
      id: "userId",
      label: "Username",
      type: "text",
      placeholder: "Type your username",
      autoComplete: "username",
      helperText: null,
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
    uid: "password",
    gridProps: { item: true, xs: 12 },
    fieldProps: {
      required: true,
      name: "password",
      id: "password",
      label: "Password",
      type: "password",
      placeholder: "Type your password",
      autoComplete: "password",
      helperText: null,
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
];

export const getCurrentLoginType = (type) => allLoginTypes.find((item) => item.type === type);

export const otherLoginTypes = (currentType) => allLoginTypes.filter((login) => login.type !== currentType);

export const helperTextValue = (type) => {
  switch (type) {
    case SUPER_ADMIN:
      return "Please contact the blockchain developer if you have forgotten your password";
    case ADMIN:
      return "Please contact the superuser head of network if you have forgotten your password";
    case PATIENT:
    case DOCTOR:
      return (
        <Link to={signupRoute} style={{ color: "inherit" }}>
          <b>Not signed in yet? Click here to sign up now</b>
        </Link>
      );
    default:
      return null;
  }
};
