import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ERROR } from "../../common/contants/notification";
import { logOut, logIn } from "../../features/auth/authSlice";
import { setNotification } from "../../features/notifications/notificationSlice";

// TODO: Export API BaseURL to Common Space
const baseQuery = fetchBaseQuery({
  baseUrl: "http://localhost:8081/api",
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) headers.set("authorization", `Bearer ${token}`);

    return headers;
  },
});

const baseQueryWithReAuth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  if (result?.error?.status === 403) {
    console.log("Sending Refresh Token");

    // Send Refresh Token to get new access token
    const refreshResult = await baseQuery({ url: "auth/refresh", method: "POST" }, api, extraOptions);
    console.log(refreshResult);

    if (refreshResult?.data) {
      const user = api.getState().auth.user;
      // Store the new token
      api.dispatch(logIn({ ...refreshResult.data, user }));
      result = await baseQuery(args, api, extraOptions);
    } else {
      await baseQuery({ url: "auth/logout", method: "POST" }, api, extraOptions);
      api.dispatch(setNotification(`Security Alert !!`, "We have logged you out for your account security", ERROR));
      api.dispatch(logOut());
    }
  }

  return result;
};

export const apiSlice = createApi({
  baseQuery: baseQueryWithReAuth,
  endpoints: (builder) => ({}),
});
