import Environment from "./Environment";
export const SUPER_ADMIN_CREDENTIALS = {
    username: "SuperAdmin",
    password: "SuperAdminpw",
};
export const SALT_WORK_FACTOR = 10;
export const TOKEN_ATTRIBUTES = {
    aTokenExpiresIn: "5m",
    rTokenExpiresIn: "1h",
    cookieMaxAge: 24 * 60 * 60 * 1000,
};
export const AUTH_HEADER_KEY = "authorization";
export const SHELL_SCRIPTS = {
    findConfigLocation: `find ${Environment.NETWORK_APP_DIR} -name \"${Environment.NETWORK_TEMPLATE_DIR}\" 2>/dev/null`,
    executeStartNetwork: `echo "${Environment.ROOT_PASSWORD}" | sudo -S "./startFabric.sh"`,
    executeStopNetwork: `echo "${Environment.ROOT_PASSWORD}" | sudo -S "./networkDown.sh"`,
};
//# sourceMappingURL=Defaults.js.map