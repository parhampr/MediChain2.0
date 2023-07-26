export const homeRoute = "/";
export const loginRoute = "/login";
export const signupRoute = "/signup";
export const networkTemporaryRoute = "/network";
export const networkDashboard = "/network/dashboard";
export const networkDashboardOrganizationPage = (id) => `/network/dashboard/${id ? id : ":netId"}`;
