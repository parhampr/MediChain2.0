import { ArrowBack } from "@mui/icons-material";
import { AppBar, Box, Button, ButtonGroup, Container, Dialog, IconButton, Toolbar, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useStylesSignupClass } from "../../classes/auth/signupClass";
import { DOCTOR, PATIENT } from "../../common/contants/userRoles";
import { AppThemeMode, Transition } from "../../common/utils/stylesFunction";
import { AppForm } from "../../components/generalFormHelper";
import { errorConfig, signUpFormConfig } from "../../config/signupConfig";
import { selectSelectedSignupType, setSeletedSignupType } from "./authSlice";

const SignUpFormWithHeader = () => {
  const signupType = useSelector(selectSelectedSignupType);
  const classess = useStylesSignupClass();

  return (
    <AppForm accordions={signUpFormConfig(signupType)} errorContent={errorConfig}>
      <Typography component="span" variant="h6" className={classess.nestedTypography}>
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

  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flex: 1, mx: 1 }}>
      <Typography variant="h6" component="div">
        New {signUpType === PATIENT ? "Patient" : "Doctor"} Signup
      </Typography>
      <ButtonGroup
        size="small"
        variant="outlined"
        aria-label="change sign up type"
        disableElevation
        sx={{ "& button": { textTransform: "capitalize" } }}
      >
        {[PATIENT, DOCTOR].map((button, i) => (
          <Button
            key={i}
            variant={signUpType === button ? "contained" : "outlined"}
            onClick={() => dispatch(setSeletedSignupType(button))}
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
  const classess = useStylesSignupClass();
  const closeDialogBox = () => navigate("/login");

  return (
    <Dialog
      fullScreen
      open={true}
      onClose={closeDialogBox}
      TransitionComponent={Transition}
      PaperProps={{
        sx: {
          bgcolor: "background.default",
          backgroundImage: "none",
        },
      }}
    >
      <AppBar className={classess.appBarStyle}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={closeDialogBox} aria-label="close">
            <ArrowBack />
          </IconButton>
          <ToolBarContent />
          <AppThemeMode edge="end" color="primary" />
        </Toolbar>
      </AppBar>
      <Container>
        <Box component={"div"} className={classess.containerBox}>
          <SignUpFormWithHeader />
        </Box>
      </Container>
    </Dialog>
  );
};
