import { makeStyles } from "@mui/styles";

export const useStylesSignupClass = makeStyles((theme) => ({
  appBarStyle: {
    position: "sticky !important",
    top: 0,
    backgroundColor: `${theme.palette.primary.sectionContainer} !important`,
    color: `${theme.palette.text.primary} !important`,
    backgroundImage: "none !important",
  },
  containerBox: {
    borderRadius: 12,
    marginTop: theme.spacing(4),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.primary.sectionContainer,
    boxShadow: "0px 3px 1px -2px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 1px 5px 0px rgb(0 0 0 / 12%)",
  },

  nestedTypography: {
    "& .MuiTypography-root": {
      color: theme.palette.text.secondary,
    },
  },
}));
