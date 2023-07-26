import { Fitbit } from "@mui/icons-material";
import { Container, IconButton, Tooltip } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { loginRoute } from "../../common/contants/routesConstants";
import { SUPER_ADMIN } from "../../common/contants/userRoles";
import { Header } from "../../components/Header";
import { selectCurrentToken, selectCurrentUser, setSeletedLoginType } from "../auth/authSlice";

export const RequireAuthForSuperAdmin = () => {
  const location = useLocation();
  const user = useSelector(selectCurrentUser);
  const token = useSelector(selectCurrentToken);
  const dispatch = useDispatch();
  const canProceed = [token, user].every(Boolean) && user.type === SUPER_ADMIN;

  if (!canProceed) {
    // TODO ERROR BELOW LINE
    // dispatch(setSeletedLoginType(SUPER_ADMIN));
    return <Navigate to={loginRoute} state={{ from: location }} replace />;
  }

  return (
    <>
      <Header>
        <Tooltip title="Activity Log">
          {/* TODO Link for Activity log */}
          <IconButton color="primary" sx={{ mr: 1 }} onClick={() => {}}>
            <Fitbit />
          </IconButton>
        </Tooltip>
      </Header>
      <Container component="main" maxWidth="xl" sx={{ flex: 1 }}>
        <Outlet />
      </Container>
    </>
  );
};
