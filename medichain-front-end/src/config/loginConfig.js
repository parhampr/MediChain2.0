import { AlternateEmail, Lock, Visibility, VisibilityOff } from "@mui/icons-material";
import { IconButton, InputAdornment, Tooltip } from "@mui/material";
import { Link } from "react-router-dom";
import { PUBLIC_ROUTES } from "../common/constants/routesConstants";
import { ROLE, allLoginTypes } from "../common/constants/userProperties";

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

export const getCurrentLoginType = (currentType) => allLoginTypes.find((item) => item.type === currentType);

export const otherLoginTypes = (currentType) => allLoginTypes.filter((login) => login.type !== currentType);

export const helperTextValue = (currentType) => {
  switch (currentType) {
    case ROLE.SUPER_ADMIN:
      return "Please contact the blockchain developer if you have forgotten your password";
    case ROLE.ADMIN:
      return "Please contact the superuser head of network if you have forgotten your password";
    case ROLE.PATIENT:
    case ROLE.DOCTOR:
      return (
        <Link to={PUBLIC_ROUTES.signupRoute} style={{ color: "inherit" }}>
          <b>Not signed in yet? Click here to sign up now</b>
        </Link>
      );
    default:
      return null;
  }
};
