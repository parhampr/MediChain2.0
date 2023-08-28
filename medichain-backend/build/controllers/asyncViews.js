import { SHELL_SCRIPTS } from "../app/configs/Defaults";
import Environment from "../app/configs/Environment";
import { NETWORK_STATUS } from "../app/configs/Network";
import utils from "../app/utilities/utils";
import shell from "shelljs";
const execSilently = (execCommandFn) => {
    shell.config.silent = true;
    execCommandFn();
    shell.config.silent = false;
};
export function stopHLFNetwork(network) {
    execSilently(() => shell.pushd(Environment.NETWORK_APP_DIR));
    shell.exec(SHELL_SCRIPTS.executeStopNetwork, function (executeStopNetworkCode) {
        utils.updateNetworkStatus(network, executeStopNetworkCode === 0 ? NETWORK_STATUS.stopped : NETWORK_STATUS.failedToStop);
        execSilently(() => shell.popd());
    });
}
export function generateAndRunNetworkConfiguration(network, shellCommand) {
    shell.exec(SHELL_SCRIPTS.findConfigLocation, function (_, stdout) {
        execSilently(() => shell.pushd(stdout.trim()));
        shell.exec(`${Environment.CONFIG_FILE} ${shellCommand}`, function (configGenerationCode) {
            execSilently(() => shell.popd());
            if (configGenerationCode === 0) {
                execSilently(() => shell.pushd(Environment.NETWORK_APP_DIR));
                shell.exec(SHELL_SCRIPTS.executeStartNetwork, function (executeStartNetworkCode) {
                    utils.updateNetworkStatus(network, executeStartNetworkCode === 0 ? NETWORK_STATUS.started : NETWORK_STATUS.failedToStart);
                    execSilently(() => shell.popd());
                });
            }
            else
                utils.updateNetworkStatus(network, NETWORK_STATUS.failedToStart);
        });
    });
}
//# sourceMappingURL=asyncViews.js.map