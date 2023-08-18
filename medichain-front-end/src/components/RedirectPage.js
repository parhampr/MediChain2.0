import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { USER_PROPS } from "../common/constants/userProperties";
import { selectLoggedUserType } from "../features/auth/authSlice";

export const RedirectLoggedInOutUser = () => {
  const type = useSelector(selectLoggedUserType);
  return type ? <Navigate to={USER_PROPS[type].linkToHome} replace /> : <Outlet />;
};
