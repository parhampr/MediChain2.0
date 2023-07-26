import { createSlice } from "@reduxjs/toolkit";
import { apiSlice } from "../../app/api/apiSlice";
import { GET_UNENCRYPTED_OBJ, removeToken, SET_ENCRYPTED_OBJ } from "../../common/contants/authConstants";
import { PATIENT, SUPER_ADMIN } from "../../common/contants/userRoles";
import { userProps } from "../../common/utils/headerProps";

const initialState = () => {
  const init = {
    selectedLoginType: SUPER_ADMIN,
    selectedSignupType: PATIENT,
    user: null,
    userProps: null,
    token: null,
  };
  const JWT = GET_UNENCRYPTED_OBJ();
  if (!JWT) return init;

  const { iat, exp, ...rest } = JSON.parse(window.atob(JWT.split(".")[1]));
  if (Date.now() < exp * 1000) {
    init.user = rest;
    init.userProps = userProps(rest.type);
    init.token = JWT;
  }

  return init;
};

const authSlice = createSlice({
  name: "auth",
  initialState: initialState(),
  reducers: {
    setSeletedLoginType: (state, action) => {
      state.selectedLoginType = action.payload;
    },

    setSeletedSignupType: (state, action) => {
      state.selectedSignupType = action.payload;
    },

    logIn: (state, action) => {
      const { user, accessToken } = action.payload;
      state.user = user;
      state.token = accessToken;
      state.userProps = userProps(user.type);
      SET_ENCRYPTED_OBJ(accessToken);
    },

    logOut: (state) => {
      state.user = null;
      state.token = null;
      removeToken();
    },
  },

  extraReducers: (builder) => {
    builder
      .addMatcher(apiSlice.endpoints.login.matchFulfilled, (state, action) => {
        authSlice.caseReducers.logIn(state, action);
      })
      .addMatcher(apiSlice.endpoints.logout.matchFulfilled, (state, action) => {
        authSlice.caseReducers.logOut(state, action);
      })
      .addMatcher(apiSlice.endpoints.logout.matchRejected, (state) => {
        authSlice.caseReducers.logOut(state);
      });
  },
});

export const { setSeletedLoginType, setSeletedSignupType, logIn, logOut } = authSlice.actions;

export const selectCurrentUser = (state) => state.auth.user;
export const selectCurrentToken = (state) => state.auth.token;
export const selectUserProps = (state) => state.auth.userProps;
export const selectSelectedLoginType = (state) => state.auth.selectedLoginType;
export const selectSelectedSignupType = (state) => state.auth.selectedSignupType;

export default authSlice.reducer;
