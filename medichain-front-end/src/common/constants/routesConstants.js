export const PUBLIC_ROUTES = {
  homeRoute: "/",
  loginRoute: "/login",
  signupRoute: "/signup",
};

export const SUPER_ADMIN_ROUTES = {
  networkTemporaryRoute: "/network",
  networkDashboard: "/network/dashboard",
  networkDashboardOrganizationPage: (id) => `/network/dashboard/${id ? id : ":netId"}`,
};

export const ADMIN_ROUTES = {};
export const PATIENT_ROUTES = {};
export const DOCTOR_ROUTES = {};
