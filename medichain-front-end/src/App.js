import { AppRoutesProvider } from "./AppRoutes";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { designTheme } from "./theme/theme";
import { BrowserRouter } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsThemeDark } from "./features/theme/themeSlice";
import { MODE } from "./common/constants/themeMode";

function App() {
  const currentThemeMode = useSelector(selectIsThemeDark);
  const theme = createTheme(designTheme(currentThemeMode ? MODE.DARK : MODE.LIGHT));
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        <AppRoutesProvider />
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
