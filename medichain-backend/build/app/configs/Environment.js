import dotenv from "dotenv";
import * as assert from "assert";
import chalk from "chalk";
import path from "path";
import { PORT_ATTRIBUTES } from "../constants/Common";
dotenv.config();
class Environment {
    HOST_URL;
    DATABASE_URI;
    ROOT_APP_DIR;
    NETWORK_APP_DIR;
    NETWORK_TEMPLATE_DIR;
    ROOT_PASSWORD;
    CONFIG_FILE;
    ACCESS_TOKEN_SECRET;
    REFRESH_ACCESS_TOKEN_SECRET;
    SERVER_PORT;
    NETWORK_PORTS;
    WALLET_BASE;
    ORGANIZATION_BASE;
    constructor() {
        assert.ok(process.env.DATABASE_URI, chalk.bold("\n" + chalk.bgRed(" Env Error "), ":", chalk.red("<DATABASE_URI> MUST BE DEFINED")));
        assert.ok(process.env.NETWORK_APP_DIR, chalk.bold("\n" + chalk.bgRed(" Env Error "), ":", chalk.red("<NETWORK_APP_DIR> MUST BE DEFINED")));
        assert.ok(process.env.NETWORK_TEMPLATE_DIR, chalk.bold("\n" + chalk.bgRed(" Env Error "), ":", chalk.red("<NETWORK_TEMPLATE_DIR> MUST BE DEFINED")));
        assert.ok(process.env.ROOT_PASSWORD, chalk.bold("\n" + chalk.bgRed(" Env Error "), ":", chalk.red("<ROOT_PASSWORD> MUST BE DEFINED")));
        assert.ok(process.env.NETWORK_PORTS, chalk.bold("\n" + chalk.bgRed(" Env Error "), ":", chalk.red("<NETWORK_PORTS> MUST BE DEFINED")));
        assert.ok(process.env.ACCESS_TOKEN_SECRET, chalk.bold("\n" + chalk.bgRed(" Env Error "), ":", chalk.red("<ACCESS_TOKEN_SECRET> MUST BE DEFINED")));
        assert.ok(process.env.REFRESH_ACCESS_TOKEN_SECRET, chalk.bold("\n" + chalk.bgRed(" Env Error "), ":", chalk.red("<REFRESH_ACCESS_TOKEN_SECRET> MUST BE DEFINED")));
        if (!process.env.ROOT_APP_DIR)
            console.log(chalk.bold.bgYellow(" Env Warn "), ":", chalk.yellow.bold("SETTING <ROOT_APP_DIR>", ":", process.cwd()));
        this.ROOT_APP_DIR = process.cwd();
        this.NETWORK_APP_DIR = path.join(this.ROOT_APP_DIR, process.env.NETWORK_APP_DIR);
        this.NETWORK_TEMPLATE_DIR = process.env.NETWORK_TEMPLATE_DIR;
        this.ROOT_PASSWORD = process.env.ROOT_PASSWORD;
        this.CONFIG_FILE = process.env.CONFIG_FILE;
        this.ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
        this.REFRESH_ACCESS_TOKEN_SECRET = process.env.REFRESH_ACCESS_TOKEN_SECRET;
        this.SERVER_PORT = parseInt((process.env.SERVER_PORT ?? 5000));
        this.HOST_URL = (process.env.HOST_URL ?? "http://localhost");
        this.DATABASE_URI = process.env.DATABASE_URI;
        this.WALLET_BASE = path.join(this.ROOT_APP_DIR, "wallet");
        this.ORGANIZATION_BASE = path.join(this.ROOT_APP_DIR, "ApplicationNetwork", "organizations", "peerOrganizations");
        this.NETWORK_PORTS = process.env.NETWORK_PORTS.toString()
            .split("|")
            .map((portArray) => {
            const ports = portArray.toString().split(":");
            return {
                [PORT_ATTRIBUTES.p0Port]: parseInt(ports[0]),
                [PORT_ATTRIBUTES.caPort]: parseInt(ports[1]),
                [PORT_ATTRIBUTES.couchPort]: parseInt(ports[2]),
                [PORT_ATTRIBUTES.reserved]: false,
            };
        });
        process.stdout.write("\n");
    }
}
export default new Environment();
//# sourceMappingURL=Environment.js.map