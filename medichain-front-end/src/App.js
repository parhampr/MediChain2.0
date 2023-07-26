import { AppRoutesProvider } from "./AppRoutes";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { designTheme } from "./theme/theme";
import { BrowserRouter } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsThemeDark } from "./features/theme/themeSlice";
import { VALUE_DARK_MODE, VALUE_LIGHT_MODE } from "./common/contants/themeMode";

function App() {
  const currentThemeMode = useSelector(selectIsThemeDark);
  const theme = createTheme(designTheme(currentThemeMode ? VALUE_DARK_MODE : VALUE_LIGHT_MODE));
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
