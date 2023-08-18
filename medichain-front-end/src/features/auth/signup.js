import { ArrowBack } from "@mui/icons-material";
import {
  AppBar,
  Box,
  Button,
  ButtonGroup,
  Container,
  Dialog,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useStylesSignupClass } from "../../classes/auth/signupClass";
import { ROLE } from "../../common/constants/userProperties";
import { AppThemeMode, Transition } from "../../common/utils/stylesFunction";
import { AppForm } from "../../components/generalFormHelper";
import { errorConfig, signUpFormConfig } from "../../config/signupConfig";
import { selectSelectedSignupType, setSelectedLoginType, setSelectedSignupType } from "./authSlice";
import { PUBLIC_ROUTES } from "../../common/constants/routesConstants";

const SignUpFormWithHeader = () => {
  const signupType = useSelector(selectSelectedSignupType);
  const classes = useStylesSignupClass();

  return (
    <AppForm accordions={signUpFormConfig(signupType)} errorContent={errorConfig}>
      <Typography component="span" variant="h6" className={classes.nestedTypography}>
        {/*  TODO
            {user && (
              <span>
                Signup On Patient's Behalf -<b> For {user.org}</b>
              </span>
            )} */}
        Signup to Create Account
        <Typography>
          <small>
            {/* TODO
                {user &&
                  "The patient's details filled below on their behalf are concluded as accurately spoken by patient themselves. The password filled is temporary and patient needs to put a new password when they login."}
                 */}
            Your personal information should be filled out as precisely as possible to enable the hospital to quickly
            recognize you and reach a correct diagnosis.
          </small>
        </Typography>
        <Typography>
          <small>
            <em>* All four sections of the form are required to create the account</em>
          </small>
        </Typography>
      </Typography>
    </AppForm>
  );
};

const ToolBarContent = () => {
  const dispatch = useDispatch();
  const signUpType = useSelector(selectSelectedSignupType);

  const changeType = (type) => {
    dispatch(setSelectedSignupType(type));
    dispatch(setSelectedLoginType(type));
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flex: 1, mx: 1 }}>
      <Typography variant="h6" component="div">
        New {signUpType === ROLE.PATIENT ? "Patient" : "Doctor"} Signup
      </Typography>
      <ButtonGroup
        size="small"
        variant="outlined"
        aria-label="change sign up type"
        disableElevation
        sx={{ "& button": { textTransform: "capitalize" } }}
      >
        {[ROLE.PATIENT, ROLE.DOCTOR].map((button, i) => (
          <Button
            key={i}
            variant={signUpType === button ? "contained" : "outlined"}
            onClick={() => changeType(button)}
            title={`Switch to ${button} type`}
          >
            <b>{button}</b>
          </Button>
        ))}
      </ButtonGroup>
    </Box>
  );
};

// TODO SIGNUP STILL
export const SignUp = () => {
  const navigate = useNavigate();
  const classes = useStylesSignupClass();
  const closeDialogBox = () => navigate(PUBLIC_ROUTES.loginRoute);

  return (
    <Dialog
      fullScreen
      open={true}
      onClose={closeDialogBox}
      TransitionComponent={Transition}
      PaperProps={{
        sx: {
          backgroundColor: "background.default",
          backgroundImage: "none",
        },
      }}
    >
      <AppBar className={classes.appBarStyle}>
        <Toolbar>
          <Tooltip title={"Go to login"}>
            <IconButton edge="start" color="inherit" onClick={closeDialogBox} aria-label="close">
              <ArrowBack />
            </IconButton>
          </Tooltip>
          <ToolBarContent />
          <AppThemeMode edge="end" color="primary" />
        </Toolbar>
      </AppBar>
      <Container>
        <Box component={"div"} className={classes.containerBox}>
          <SignUpFormWithHeader />
        </Box>
      </Container>
    </Dialog>
  );
};
