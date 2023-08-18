import { Fitbit } from "@mui/icons-material";
import { Container, IconButton, Tooltip } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet, matchPath, useLocation, useNavigate } from "react-router-dom";
import { PUBLIC_ROUTES } from "../../common/constants/routesConstants";
import { ROLE, USER_PROPS } from "../../common/constants/userProperties";
import { Header } from "../../components/Header";
import { selectLoggedUserType, setSelectedLoginType } from "../auth/authSlice";
import React, { useEffect, useState } from "react";
import { useLogoutMutation } from "../auth/authApiSlice";
import { LoadingProgress } from "../../common/utils/stylesFunction";
import { ERROR } from "../../common/constants/notification";
import { setNotification } from "../notifications/notificationSlice";

const HeaderContentForRoles = ({ roleType }) => {
  switch (roleType) {
    case ROLE.SUPER_ADMIN:
      return (
        <Tooltip title="Activity Log">
          {/* TODO Link for Activity log */}
          <IconButton color="primary" sx={{ mr: 1 }} onClick={() => {}}>
            <Fitbit />
          </IconButton>
        </Tooltip>
      );
    case ROLE.ADMIN:
      return <></>;
    case ROLE.DOCTOR:
      return <></>;
    case ROLE.PATIENT:
      return <></>;
    default:
      return <React.Fragment />;
  }
};

export const RequireAuth = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [logout] = useLogoutMutation();
  const dispatch = useDispatch();
  const nav = useNavigate();
  const type = useSelector(selectLoggedUserType);
  const isMatchingUserPath =
    type && USER_PROPS[type].routes.some((path) => matchPath({ path, exact: true }, location.pathname));

  useEffect(() => {
    const logoutUser = async () => {
      await logout();
      dispatch(setSelectedLoginType(type ?? ROLE.SUPER_ADMIN));
      dispatch(
        setNotification(
          `Unauthorized Path`,
          "You have been logged out for your security. Please login to continue.",
          ERROR
        )
      );
      nav(PUBLIC_ROUTES.loginRoute);
    };

    if (type && !isMatchingUserPath) logoutUser();
    else setLoading(false);
  }, [type, isMatchingUserPath, logout, dispatch, nav]);

  return loading ? (
    <LoadingProgress sx={{ height: "100vh", width: "100vw" }} />
  ) : isMatchingUserPath ? (
    <>
      <Header>
        <HeaderContentForRoles roleType={type} />
      </Header>
      <Container component="main" maxWidth="xl" sx={{ flex: 1 }}>
        <Outlet />
      </Container>
    </>
  ) : (
    <Navigate to={PUBLIC_ROUTES.loginRoute} state={{ from: location }} replace />
  );
};
