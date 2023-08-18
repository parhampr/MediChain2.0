import { createSlice } from "@reduxjs/toolkit";
import { MODE } from "../../common/constants/themeMode";

const themeSlice = createSlice({
  name: "theme",
  initialState: { mode: null },
  reducers: {
    initializeThemeMode: (state) => {
      const initialTheme = localStorage.getItem(MODE.KEY) ?? MODE.LIGHT;
      localStorage.setItem(MODE.KEY, initialTheme);
      state.mode = initialTheme;
    },
    toggleThemeMode: (state) => {
      const newThemeMode = state.mode === MODE.DARK ? MODE.LIGHT : MODE.DARK;
      localStorage.setItem(MODE.KEY, newThemeMode);
      state.mode = newThemeMode;
    },
  },
});

export const { toggleThemeMode, initializeThemeMode } = themeSlice.actions;
export const selectCurrentThemeMode = (state) => state.theme.mode;
export const selectIsThemeDark = (state) => state.theme.mode === MODE.DARK;
export default themeSlice.reducer;
