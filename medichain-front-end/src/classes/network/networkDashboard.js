import { makeStyles } from "@mui/styles";

export const useStylesNetworkDashboardClass = makeStyles((theme) => ({
  cardBoxContainer: {
    position: "relative",
    maxWidth: "500px",
    borderRadius: "10px",
    backgroundColor: theme.palette.primary.sectionContainer,
    padding: theme.spacing(2),
    textDecoration: "none",
    overflow: "hidden",
    zIndex: 0,
    top: 0,
    border: `1px solid ${theme.palette.primary.sectionBorder600}`,
    transition: "all 0.1s ease-out",
    cursor: "pointer",
    "&:hover": {
      boxShadow: "0px 4px 8px rgba(38, 38, 38, 0.2)",
      top: "-4px",
      border: `1px solid ${theme.palette.primary.sectionBorder600}`,
      backgroundColor: theme.palette.background.default,
    },

    "&:hover $goNextArrow": {
      width: "50px",
    },
  },

  goNextArrow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    width: "32px",
    height: "32px",
    overflow: "hidden",
    top: 0,
    right: 0,
    backgroundColor: theme.palette.primary.main,
    borderRadius: "0 4px 0 32px",
    transition: "all 0.1s ease-out",
  },

  goArrow: {
    marginTop: "-4px !important",
    marginRight: "-4px !important",
  },

  cardBoxHeaderContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: theme.spacing(2),
  },

  accordion: {
    backgroundColor: `${theme.palette.primary.sectionContainer} !important`,
    backgroundImage: "none !important",
    boxShadow: "none !important",
  },

  accordionSummary: {
    backgroundColor: `${theme.palette.primary.secondarySectionContainer} !important`,
  },
}));
