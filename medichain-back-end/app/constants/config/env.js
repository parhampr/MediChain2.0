import dotenv from "dotenv";

dotenv.config();

export const {
  PORT: port,
  HOST: host,
  HOST_URL: hostURL,
  DATABASE_URI: dbURL,
  ACCESS_TOKEN_SECRET: accessTokenSecret,
  REFRESH_ACCESS_TOKEN_SECRET: refreshTokenSecret,
  ROOT_APP_DIR: rootAppDirectory,
  NETWORK_APP_DIR: networkAppDirectory,
  NETWORK_TEMPLATE_FOLDER: networkTemplateFolderName,
  PASSWORD: passwordForAuthorization,
  GENERATE_CONFIG_FILE: generateConfigFileName,
  SERVER_PORTS: serverPortsForDocker,
} = process.env;
