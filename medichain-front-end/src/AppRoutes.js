import { Navigate, Route, Routes } from "react-router-dom";
import {
  homeRoute,
  loginRoute,
  networkDashboard,
  networkDashboardOrganizationPage,
  networkTemporaryRoute,
  signupRoute,
} from "./common/contants/routesConstants";
import { Layout } from "./components/Layout";
import { Login } from "./features/auth/login";
import { SignUp } from "./features/auth/signup";
import { NetworkDashboard } from "./features/network/dashboard";
import { RequireAuthForSuperAdmin } from "./features/network/RequireAuth";
import { OrganizationTableBoard } from "./features/network/orgBoard";

export const AppRoutesProvider = () => {
  return (
    <Routes>
      <Route path={homeRoute} element={<Layout />}>
        <Route index element={<></>} />
        <Route path={loginRoute} element={<Login />} />
        <Route path={signupRoute} element={<SignUp />} />
        <Route path={networkTemporaryRoute} element={<Navigate to={networkDashboard} replace />} />
        <Route element={<RequireAuthForSuperAdmin />}>
          <Route path={networkDashboard} element={<NetworkDashboard />} />
          <Route path={networkDashboardOrganizationPage()} element={<OrganizationTableBoard />} />
        </Route>
      </Route>
    </Routes>
  );
};
