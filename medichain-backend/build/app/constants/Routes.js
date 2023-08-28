export const baseAPIRoute = "/api";
export const baseAuthRoute = baseAPIRoute + "/auth";
export const basePublicRoute = baseAPIRoute + "/public";
export const baseSuperAdminRoute = baseAPIRoute + "/network";
export const AUTH_ROUTES = {
    LOGIN: "/login",
    REFRESH: "/refresh",
    LOGOUT: "/logout",
};
export const PUBLIC_ROUTES = {
    GET_ENROLLED: "/get/enrolled",
};
export const SUPER_ADMIN_ROUTES = {
    CREATE_NETWORK: "/create_network",
    CREATE_ORGANIZATION: "/create_organization",
    ENROLL_ORGANIZATION: "/enroll_organization/:netId/:orgId",
    DELETE_ORGANIZATION: "/delete_organization/:netId/:orgId",
    FETCH_NETWORK: "/fetch",
    START_NETWORK: "/hlf/start",
    STOP_NETWORK: "/hlf/stop",
};
//# sourceMappingURL=Routes.js.map