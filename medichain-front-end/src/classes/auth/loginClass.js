import { makeStyles } from "@mui/styles";

export const useStylesLoginClass = makeStyles((theme) => ({
  bodyContainer: {
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: "stretch",
    alignItems: "stretch",
  },

  containerDiv: {
    display: "flex",
    justifyContent: "center",
  },

  sectionLeft: {
    position: "relative",
    minWidth: "60%",
    borderRadius: "0 0 100px 0",
    "@media(max-width: 985px)": {
      minWidth: "100%",
    },

    "&::before": {
      content: `""`,
      position: "absolute",
      bottom: 0,
      right: 0,
      width: "130px",
      height: "130px",
      background: `radial-gradient(circle 132px at top left, #0000 98%, ${theme.palette.primary.main}) top left`,
    },
  },

  sectionRight: {
    minWidth: "40%",
    backgroundColor: theme.palette.primary.main,
    overflow: "hidden",
    borderRadius: "100px 0 0 0",
    "@media(max-width: 985px)": {
      display: "none",
    },
  },

  loginContainerBox: {
    alignSelf: "center",
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.primary.sectionContainer,
    padding: theme.spacing(2, 3),
    fontSize: theme.typography.fontSize,
    boxShadow: theme.palette.shape.boxShadow,
    borderRadius: 8,
    maxWidth: "420px",
    minWidth: "340px",
    minHeight: "595px",
    textAlign: "center",
    margin: `0 ${theme.spacing(2)}`,
  },

  loginHeaderTypeBox: {
    display: "flex",
    justifyContent: "center",
    backgroundColor: theme.palette.primary.sectionBorder,
    borderRadius: "20px",
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },

  appLogoClass: {
    margin: "auto",
    width: "70px !important",
    height: "70px !important",
    border: "3px solid",
    borderLeftColor: theme.palette.text.primary,
    borderTopColor: theme.palette.text.primary,
    borderRightColor: theme.palette.primary.main,
    borderBottomColor: theme.palette.primary.main,
    "& .MuiAvatar-img": {
      height: "35px !important",
      width: "fit-content !important",
    },
  },

  loginFieldsContainer: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    textAlign: "center",
  },
}));
