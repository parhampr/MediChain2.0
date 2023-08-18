import { amber } from "@mui/material/colors";

export const designTheme = (mode) => ({
  "@global": {
    "*::-webkit-scrollbar": {
      width: "0.6em",
      height: "0.6em",
      backgroundColor: "#F5F5F5",
    },
    "*::-webkit-scrollbar-corner": {
      backgroundColor: "transparent",
    },
    "*::-webkit-scrollbar-track": {
      backgroundColor: "rgba(0, 0, 0, 0.1)",
      borderRadius: "10px",
    },
    "*::-webkit-scrollbar-thumb": {
      backgroundColor: "rgba(0, 0, 0, 0.4)",
      borderRadius: "10px",
      border: "2px solid transparent",
      backgroundClip: "content-box",
    },
    "*::-webkit-scrollbar-thumb:hover": {
      backgroundColor: "rgba(0, 0, 0, 0.7)",
    },
    "*::-webkit-scrollbar-thumb:active": {
      backgroundColor: "rgba(0, 0, 0, 0.9)",
    },
  },
  typography: {
    fontSize: 13,
  },
  palette: {
    mode,
    primary: {
      ...(mode === "light"
        ? {
            main: "#0C3E8C",
            sectionContainer: "#FFF",
            secondarySectionContainer: "#7c86ff33",
            sectionBorder100: "rgba(24, 24, 24, 0.12)",
            sectionBorder600: "rgba(0, 0, 0, 0.17)",
            background100: "rgba(12, 62, 140, 0.1)",
          }
        : {
            main: amber[600],
            sectionContainer: "#1a202c",
            secondarySectionContainer: "#18343F",
            // sectionContainer: "#0A1929",
            sectionBorder100: "rgba(130, 130, 130, 0.12)",
            sectionBorder600: "rgba(255, 255, 255, 0.12)",
            background100: "rgba(255, 179, 0, 0.1)",
          }),
    },
    ...(mode === "light"
      ? {
          background: {
            default: "#F3F6FD",
            secondary: "#FFF",
          },
        }
      : {
          background: {
            default: "#171923",
            secondary: "#1a202c",
            // default: "#001E3C",
          },
        }),
    text: {
      ...(mode === "light"
        ? {
            primary: "#000",
            secondary: "#606060",
            reverse: "#fff",
          }
        : {
            primary: "#fff",
            secondary: "#C4C4C4",
            reverse: "#000",
          }),
    },
    shape: {
      boxShadow:
        "0px 3px 1px -2px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 1px 5px 0px rgb(0 0 0 / 12%)",
    },
    error: {
      main: "#d32f2f",
      secondary: "rgba(250, 0, 0, 0.123)",
      tertiary: mode === "light" ? "#ffc5c5" : "#780000",
    },

    success: {
      main: "#2e7d32",
      secondary: "rgba(28, 173, 105, 0.219)",
    },

    info: {
      main: "#0288d1",
      secondary: "#0288d11a",
    },
  },
});
