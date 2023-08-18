import { createSlice } from "@reduxjs/toolkit";
import { apiSlice } from "../../app/api/apiSlice";
import { GET_UNENCRYPTED_OBJ, removeToken, SET_ENCRYPTED_OBJ } from "../../common/constants/authConstants";
import { ROLE, USER_PROPS } from "../../common/constants/userProperties";

const initialState = () => {
  const init = {
    selectedLoginType: ROLE.SUPER_ADMIN,
    selectedSignupType: ROLE.PATIENT,
    user: null,
    userProps: null,
    token: null,
  };
  const JWT = GET_UNENCRYPTED_OBJ();
  if (!JWT) return init;

  const { iat, exp, ...rest } = JSON.parse(window.atob(JWT.split(".")[1]));
  if (Date.now() < exp * 1000) {
    init.user = rest;
    init.userProps = USER_PROPS[rest.type];
    init.token = JWT;
  }

  return init;
};

const authSlice = createSlice({
  name: "auth",
  initialState: initialState(),
  reducers: {
    setSelectedLoginType: (state, action) => {
      state.selectedLoginType = action.payload;
    },

    setSelectedSignupType: (state, action) => {
      state.selectedSignupType = action.payload;
    },

    logIn: (state, action) => {
      const { user, accessToken } = action.payload;
      state.user = user;
      state.token = accessToken;
      state.userProps = USER_PROPS[user.type];
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

export const { setSelectedLoginType, setSelectedSignupType, logIn, logOut } = authSlice.actions;

export const selectCurrentUser = (state) => state.auth.user;
export const selectCurrentToken = (state) => state.auth.token;
export const selectLoggedUserType = (state) => state.auth.user?.type;
export const selectUserProps = (state) => state.auth.userProps;
export const selectSelectedLoginType = (state) => state.auth.selectedLoginType;
export const selectSelectedSignupType = (state) => state.auth.selectedSignupType;

export default authSlice.reducer;
