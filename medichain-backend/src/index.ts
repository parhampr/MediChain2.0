import { baseAuthRoute, basePublicRoute, baseSuperAdminRoute } from "@Constant/Routes";
import { checkForSuperAdminUser, verifyJwtToken } from "@Middleware/authorization";
import { LogAllIncomingRoutes } from "@Middleware/logRoutes";
import authorizationRouter from "@Route/authRoutes";
import publicRouter from "@Route/publicRoutes";
import superAdminRouter from "@Route/sadminRoutes";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { json } from "express";
import Server from "./Server";

const server = new Server();
const expressApp = express();

expressApp.use(cors({ credentials: true, origin: "http://localhost:3001" }));
expressApp.use(json());
expressApp.use(cookieParser());

// logger
expressApp.use(LogAllIncomingRoutes);

expressApp.use(basePublicRoute, publicRouter);
expressApp.use(baseAuthRoute, authorizationRouter);
// Verify if user is authorized
expressApp.use(verifyJwtToken);
expressApp.use(baseSuperAdminRoute, checkForSuperAdminUser, superAdminRouter);
expressApp.use("/api", (_req, res) => res.status(200).send("Api is running successfully"));

server.run(expressApp);
