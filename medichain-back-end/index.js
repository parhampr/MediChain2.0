"use strict";

import { onStartUp } from "./app/utils/utilsFns.js";
import express, { json } from "express";
import cors from "cors";
import {
  dbURL,
  generateConfigFileName,
  host,
  hostURL,
  port,
  rootAppDirectory,
  networkAppDirectory,
  serverPortsForDocker,
} from "./app/constants/config/env.js";
import assert from "assert";
import authRoutes from "./routes/authRoutes.routes.js";
import sadminRoutes from "./routes/sadminRoutes.routes.js";
import publicRoutes from "./routes/publicRoutes.routes.js";
import { checkForSuperAdminUser, verifyJwtToken } from "./middleware/authorization.js";
import cookieParser from "cookie-parser";
import {
  baseAuthRouteString,
  basePublicRouteString,
  baseSAdminRouteString,
} from "./app/constants/routes/allBaseRouteString.js";
import { logAllIncomingRoutes } from "./middleware/logRoutes.js";
import { cyanColor, greenColor, LINE_UP, redColor, resetColor, yellowColor } from "./app/constants/common/constants.js";

assert(port, "Port is required");
assert(host, "Host is required");
assert(dbURL, "Database URI is required");
assert(serverPortsForDocker?.split("|")[0]?.split(":").length > 2, "Atleast collection of 1 docker port is required");
assert(rootAppDirectory, "Root App Directory (RAD) location is required");
assert(networkAppDirectory, "Network App Directory (RAD) location is required");
assert(generateConfigFileName, "Config file location is required");

const app = express();

// App Usuage
app.use(cors({ credentials: true, origin: "http://localhost:3001" }));
app.use(json());
app.use(cookieParser());
// logger
app.use(logAllIncomingRoutes);

app.use(basePublicRouteString, publicRoutes);
// Auth Routes
app.use(baseAuthRouteString, authRoutes);

// Verify if user is authorized
app.use(verifyJwtToken);

// Verify if SuperAdmin is accessing these auths then go to
// SuperAdmin Routes
app.use(baseSAdminRouteString, checkForSuperAdminUser, sadminRoutes);

// SERVER SETUP
let status = {
  serverStarted: "",
  dbStart: "",
  sCredentials: "",
  complete: "",
  removeLines: false,
};

const writeLines = (attributes, toggle = false) => {
  status = { ...status, ...attributes };
  if (status.removeLines) for (var i = 0; i < 9; i++) process.stdout.write(`${LINE_UP}`);
  process.stdout.write("------------------------------------------------------\n");
  process.stdout.write("------------------------------------------------------\n");
  process.stdout.write(`${yellowColor}Host Link: ${hostURL}:${port}/api\n`);
  process.stdout.write(`${cyanColor}Starting Server                      \t\t... ${status.serverStarted}\n`);
  process.stdout.write(`${cyanColor}Connecting to MondoDB                \t\t... ${status.dbStart}\n`);
  process.stdout.write(`${cyanColor}Adding the SuperAdmin Credentials    \t\t... ${status.sCredentials}\n`);
  process.stdout.write(`${cyanColor}Server Setup Complete                \t\t... ${status.complete}\n${resetColor}`);
  process.stdout.write("------------------------------------------------------\n");
  process.stdout.write("------------------------------------------------------\n");
  if (toggle) status.removeLines = !status.removeLines;
};

const done = () => {
  if (status.dbStart && status.sCredentials)
    if (status.dbStart.includes(redColor) || status.sCredentials.includes(redColor)) {
      writeLines({ complete: `${redColor}FAILED` });
      process.exit(1);
    } else writeLines({ complete: `${greenColor}DONE` });
};

writeLines({}, true);
app.listen(port, () => {
  writeLines({ serverStarted: `${greenColor}DONE` });
  onStartUp
    .connectMongoDB(dbURL)
    .then(() => writeLines({ dbStart: `${greenColor}DONE` }))
    .catch((e) => {
      console.log(e);
      writeLines({ dbStart: `${redColor}FAILED` });
    })
    .finally(() => done());

  onStartUp
    .createSuperUser()
    .then(() => onStartUp.createDockerPorts())
    .then(() => writeLines({ sCredentials: `${greenColor}DONE` }))
    .catch(() => writeLines({ sCredentials: `${redColor}FAILED` }))
    .finally(() => done());
});
