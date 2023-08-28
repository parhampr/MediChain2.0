import { SUPER_ADMIN_CREDENTIALS } from "@Config/Defaults";
import { default as Environment, default as envConfig } from "@Config/Environment";
import { ROLE } from "@Constant/Common";
import { Console } from "@Constant/Console";
import { baseAPIRoute } from "@Constant/Routes";
import { dockerPortsModel } from "@Model/dockerports";
import { UsersModel } from "@Model/users";
import chalk from "chalk";
import { Express } from "express";
import mongoose from "mongoose";

class Server {
  private status: Record<string, string | boolean>;
  private consoleInterval: NodeJS.Timeout;
  private timings: string[] = ["🕕", "🕖", "🕗", "🕘", "🕙", "🕚", "🕛", "🕐", "🕑", "🕒", "🕓", "🕔"];

  constructor() {
    this.finished = this.finished.bind(this);
    this.startMongoServer = this.startMongoServer.bind(this);
    this.serverCallBack = this.serverCallBack.bind(this);
    this.createDockerPorts = this.createDockerPorts.bind(this);
    this.createSuperAdmin = this.createSuperAdmin.bind(this);

    this.status = {
      serverStarted: "🕕",
      dbStart: "🕕",
      sCredentials: "🕕",
      serverPorts: "🕕",
      complete: "🕕",
      removeLines: false,
    };

    this.writeLines(true);

    this.consoleInterval = setInterval(() => {
      const tempStatus = this.status;
      for (const [key, value] of Object.entries(tempStatus))
        if (this.timings.includes(value as string)) {
          const nextIndex = this.timings.indexOf(value as string, 0);
          this.status[key] = this.timings[nextIndex + 1 >= this.timings.length ? 0 : nextIndex + 1];
        }

      this.writeLines();
    }, 100);
  }

  writeLines(toggle = false) {
    if (this.status.removeLines) for (var i = 0; i < 10; i++) process.stdout.write(Console.LineUp);
    console.log("------------------------------------------------------");
    console.log("------------------------------------------------------");
    console.log(chalk.magenta.bold("Host Link" + ":" + envConfig.HOST_URL + ":" + envConfig.SERVER_PORT + baseAPIRoute));
    console.log(chalk.cyan(`[Success Status]: Server⚡️       \t\t... ${this.status.serverStarted}`));
    console.log(chalk.cyan(`[Success Status]: MondoDB🗒️      \t\t... ${this.status.dbStart}`));
    console.log(chalk.cyan(`[Success Status]: Super-Admin👨   \t\t... ${this.status.sCredentials}`));
    console.log(chalk.cyan(`[Success Status]: Network Ports🌐    \t\t... ${this.status.serverPorts}`));
    console.log(chalk.cyan(`[Success Status]: Application🔥  \t\t... ${this.status.complete}`));
    console.log("------------------------------------------------------");
    console.log("------------------------------------------------------");
    if (toggle) this.status.removeLines = !this.status.removeLines;
  }

  private finished(error: any | undefined) {
    if (error) {
      this.status["complete"] = "❌";
      setTimeout(() => {
        console.log(chalk.bold(chalk.bgRed(" ERROR STARTING APPLICATION "), "::", chalk.red(error)));
        process.exit(1);
      }, 150);
    } else {
      this.status["complete"] = "✅";
      setTimeout(() => clearInterval(this.consoleInterval), 100);
    }
  }

  private async startMongoServer() {
    return mongoose.connect(envConfig.DATABASE_URI);
  }

  private async createSuperAdmin() {
    const superAdminUser = await UsersModel.findOne({ userId: SUPER_ADMIN_CREDENTIALS.username });
    if (!superAdminUser)
      return UsersModel.create({
        userId: SUPER_ADMIN_CREDENTIALS.username,
        password: SUPER_ADMIN_CREDENTIALS.password,
        type: ROLE.superAdmin,
      });
    return Promise.resolve();
  }

  private async createDockerPorts() {
    const portCount = await dockerPortsModel.count();
    if (portCount < Environment.NETWORK_PORTS.length) return dockerPortsModel.create(Environment.NETWORK_PORTS);
    return Promise.resolve();
  }

  private async serverCallBack() {
    let errorIfAny: any = undefined;
    this.status["serverStarted"] = "✅";
    try {
      await this.startMongoServer()
        .then(() => (this.status["dbStart"] = "✅"))
        .catch((error: any) => {
          this.status["dbStart"] = "⛔";
          this.status["sCredentials"] = "❌";
          this.status["serverPorts"] = "❌";
          throw error;
        });
      await this.createSuperAdmin()
        .then(() => (this.status["sCredentials"] = "✅"))
        .catch((error: any) => {
          this.status["sCredentials"] = "⛔";
          this.status["serverPorts"] = "❌";
          throw error;
        });
      await this.createDockerPorts()
        .then(() => (this.status["serverPorts"] = "✅"))
        .catch((error: any) => {
          this.status["serverPorts"] = "⛔";
          throw error;
        });
    } catch (error: any) {
      errorIfAny = error;
    } finally {
      this.finished(errorIfAny);
    }
  }

  run(app: Express) {
    app.listen(envConfig.SERVER_PORT, this.serverCallBack);
  }
}

export default Server;
