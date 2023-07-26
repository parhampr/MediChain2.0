import { makeStyles } from "@mui/styles";

export const useStylesLoginClass = makeStyles((theme) => ({
  containerDiv: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },

  sectionContainerBox: {
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.primary.sectionContainer,
    padding: theme.spacing(2, 3),
    fontSize: theme.typography.fontSize,
    borderRadius: 8,
    boxShadow: theme.palette.shape.boxShadow,
    maxWidth: "420px",
    minWidth: "340px",
    minHeight: "595px",
    textAlign: "center",
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
