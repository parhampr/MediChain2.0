import { createSlice } from "@reduxjs/toolkit";
import { KEY_THEME_MODE, VALUE_DARK_MODE, VALUE_LIGHT_MODE } from "../../common/contants/themeMode";

const themeSlice = createSlice({
  name: "theme",
  initialState: { mode: null },
  reducers: {
    initaliseThemeMode: (state) => {
      const initialTheme = localStorage.getItem(KEY_THEME_MODE) ?? "light";
      localStorage.setItem(KEY_THEME_MODE, initialTheme);
      state.mode = initialTheme;
    },
    toggleThemeMode: (state) => {
      const newThemeMode = state.mode === VALUE_DARK_MODE ? VALUE_LIGHT_MODE : VALUE_DARK_MODE;
      localStorage.setItem(KEY_THEME_MODE, newThemeMode);
      state.mode = newThemeMode;
    },
  },
});

export const { toggleThemeMode, initaliseThemeMode } = themeSlice.actions;
export const selectCurrentThemeMode = (state) => state.theme.mode;
export const selectIsThemeDark = (state) => state.theme.mode === VALUE_DARK_MODE;
export default themeSlice.reducer;
