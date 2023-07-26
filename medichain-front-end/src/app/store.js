import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "./api/apiSlice";
import authReducer from "../features/auth/authSlice";
import themeReducer from "../features/theme/themeSlice";
import notificationReducer from "../features/notifications/notificationSlice";
import networkReducer from "../features/network/networkSlice";

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
    theme: themeReducer,
    notifications: notificationReducer,
    network: networkReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware),
  devTools: true,
});
