import { Navigate, Route, Routes } from "react-router-dom";
import { PUBLIC_ROUTES, SUPER_ADMIN_ROUTES } from "./common/constants/routesConstants";
import { Layout } from "./components/Layout";
import { Login } from "./features/auth/login";
import { SignUp } from "./features/auth/signup";
import { NetworkDashboard } from "./features/network/dashboard";
import { RequireAuth } from "./features/network/RequireAuth";
import { OrganizationTableBoard } from "./features/network/orgBoard";
import { RedirectLoggedInOutUser } from "./components/RedirectPage";

// TODO: If admin is logged in and wants to access superadmin paths, its still goes through why because type is assessed equal to.
export const AppRoutesProvider = () => {
  return (
    <Routes>
      <Route path={PUBLIC_ROUTES.homeRoute} element={<Layout />}>
        <Route index element={<></>} />
        <Route
          path={SUPER_ADMIN_ROUTES.networkTemporaryRoute}
          element={<Navigate to={SUPER_ADMIN_ROUTES.networkDashboard} replace />}
        />
        <Route element={<RedirectLoggedInOutUser />}>
          <Route path={PUBLIC_ROUTES.loginRoute} element={<Login />} />
          <Route path={PUBLIC_ROUTES.signupRoute} element={<SignUp />} />
        </Route>
        <Route element={<RequireAuth />}>
          <Route path={SUPER_ADMIN_ROUTES.networkDashboard} element={<NetworkDashboard />} />
          <Route path={SUPER_ADMIN_ROUTES.networkDashboardOrganizationPage()} element={<OrganizationTableBoard />} />
        </Route>
      </Route>
    </Routes>
  );
};
