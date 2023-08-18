import { LoadingButton } from "@mui/lab";
import { Avatar, Box, Button, Divider, Grid, Tooltip, Typography } from "@mui/material";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { useStylesLoginClass } from "../../classes/auth/loginClass";
import { ERROR, INFO, SUCCESS } from "../../common/constants/notification";
import { AlertErrorComponent, AppThemeMode } from "../../common/utils/stylesFunction";
import { FormTextField } from "../../components/generalFormHelper";
import { getCurrentLoginType, otherLoginTypes, helperTextValue, loginFields } from "../../config/loginConfig";
import logo from "../../static/images/Logo.png";
import logo_dark from "../../static/images/Logo_dark.png";
import { setNotification } from "../notifications/notificationSlice";
import { selectIsThemeDark } from "../theme/themeSlice";
import { useLoginMutation } from "./authApiSlice";
import { selectSelectedLoginType, setSelectedLoginType, setSelectedSignupType } from "./authSlice";
import logoBg from "../../static/images/logoBg.jpg";
import { USER_PROPS } from "../../common/constants/userProperties";

const LoginFieldData = ({ type }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();
  const [error, setErr] = useState(null);
  const { state } = useLocation();

  const onSubmitForm = async (e) => {
    e.preventDefault();
    const [username, password] = new FormData(e.target).values();
    try {
      await login({ userId: username, password, type }).unwrap();
      dispatch(setNotification(`Welcome, ${username}`, "You have been logged in successfully", SUCCESS));
      navigate(state?.from?.pathname ?? USER_PROPS[type].linkToHome);
    } catch (err) {
      if (!err?.data) {
        dispatch(setNotification("Connection Error", "There was a problem connecting to the server.", ERROR));
      } else {
        setErr(err.data.DESCRIPTION);
        if (err.status === 400) {
          dispatch(setNotification(err.data.MESSAGE, err.data.DESCRIPTION, INFO));
        } else if (err.status === 401) {
          dispatch(setNotification(err.data.MESSAGE, err.data.DESCRIPTION, ERROR));
        }
      }
    }
  };

  return (
    <Box component={"form"} onSubmit={onSubmitForm}>
      <Grid container spacing={0.5}>
        {loginFields.map((item, i) => (
          <FormTextField field={item} key={i} />
        ))}
      </Grid>
      <LoadingButton
        variant="contained"
        type="submit"
        fullWidth
        loading={isLoading}
        sx={{ my: 2, borderRadius: "40px !important", height: "45px" }}
      >
        <b>login</b>
      </LoadingButton>
      {error && <AlertErrorComponent error={error} setError={setErr} />}
    </Box>
  );
};

export const Login = () => {
  const classes = useStylesLoginClass();
  const isDarkMode = useSelector(selectIsThemeDark);
  const type = useSelector(selectSelectedLoginType);
  const dispatch = useDispatch();

  const onTypeChanged = (value) => {
    dispatch(setSelectedLoginType(value));
    dispatch(setSelectedSignupType(value));
  };

  const loginTypesRender = otherLoginTypes(type).map((item, i) => (
    <Tooltip title={`Switch to ${item.label} type`} key={i}>
      <Button
        onClick={() => onTypeChanged(item.type)}
        startIcon={item.icon}
        sx={{ textTransform: "capitalize", ml: 1 }}
      >
        <b>{item.label}</b>
      </Button>
    </Tooltip>
  ));

  return (
    // <Container component="main" maxWidth="xl" sx={{ flex: 1 }}>
    <Box component={"div"} className={classes.bodyContainer}>
      <Box component={"section"} className={`${classes.containerDiv} ${classes.sectionLeft}`}>
        <Box component={"div"} className={classes.loginContainerBox}>
          {/* SECTION 1 - HEADER */}
          <Box component={"div"}>
            <Typography sx={{ textAlign: "center" }}>
              <b>Other Login Redirects</b>
            </Typography>
            <Box component={"div"} className={classes.loginHeaderTypeBox}>
              {loginTypesRender}
            </Box>
            <Divider />
          </Box>
          {/* SECTION 2 - BODY */}
          <Box component="div" className={classes.loginFieldsContainer}>
            <Avatar alt="Logo" src={isDarkMode ? logo_dark : logo} className={classes.appLogoClass} />
            <Typography variant={"h5"} sx={{ my: 2 }}>
              Welcome, {getCurrentLoginType(type).welcomeLabel}
            </Typography>
            {/* Login Fields */}
            <LoginFieldData type={type} />
          </Box>
          {/* SECTION 3 - FOOTER */}
          <Typography sx={{ textAlign: "center", my: 3 }}>{helperTextValue(type)}</Typography>
          <AppThemeMode color="primary" />
        </Box>
      </Box>
      <Box component={"section"} className={`${classes.containerDiv} ${classes.sectionRight}`}>
        <img src={logoBg} width={"50px"} height={"50px"} />
      </Box>
    </Box>
    // </Container>
  );
};
