import { networkTemplateFolderName, passwordForAuthorization, networkAppDirectory } from "./env.js";

export const shellFindConfigLocation = `find ${networkAppDirectory} -name \"${networkTemplateFolderName}\" 2>/dev/null`;
export const shellExecuteStartNetwork = `echo "${passwordForAuthorization}" | sudo -S "./startFabric.sh"`;
export const shellExecuteStopNetwork = `echo "${passwordForAuthorization}" | sudo -S "./networkDown.sh"`;
