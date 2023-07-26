import { makeStyles } from "@mui/styles";

export const useStylesOrganizationTableClass = makeStyles((theme) => ({
  outermostTableContainer: {
    marginBottom: theme.spacing(2),
    boxShadow: "0px 3px 1px -2px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 1px 5px 0px rgb(0 0 0 / 12%)",
  },

  middleMostTableContainer: {
    backgroundColor: theme.palette.primary.sectionContainer,
    borderRadius: "0 0 10px 10px",
  },
}));
