import { SHELL_SCRIPTS } from "@Config/Defaults";
import Environment from "@Config/Environment";
import { NETWORK_STATUS } from "@Config/Network";
import { INetwork } from "@Interfaces/models";
import utils from "@Utilities/utils";
import shell from "shelljs";

const execSilently = (execCommandFn: () => any) => {
  shell.config.silent = true;
  execCommandFn();
  shell.config.silent = false;
};

export function stopHLFNetwork(network: INetwork) {
  execSilently(() => shell.pushd(Environment.NETWORK_APP_DIR));
  shell.exec(SHELL_SCRIPTS.executeStopNetwork, function (executeStopNetworkCode) {
    utils.updateNetworkStatus(network, executeStopNetworkCode === 0 ? NETWORK_STATUS.stopped : NETWORK_STATUS.failedToStop);
    execSilently(() => shell.popd());
  });
}

export function generateAndRunNetworkConfiguration(network: INetwork, shellCommand: string) {
  shell.exec(SHELL_SCRIPTS.findConfigLocation, function (_, stdout) {
    execSilently(() => shell.pushd(stdout.trim()));
    shell.exec(`${Environment.CONFIG_FILE} ${shellCommand}`, function (configGenerationCode) {
      execSilently(() => shell.popd());
      if (configGenerationCode === 0) {
        execSilently(() => shell.pushd(Environment.NETWORK_APP_DIR));
        shell.exec(SHELL_SCRIPTS.executeStartNetwork, function (executeStartNetworkCode) {
          utils.updateNetworkStatus(
            network,
            executeStartNetworkCode === 0 ? NETWORK_STATUS.started : NETWORK_STATUS.failedToStart,
          );
          execSilently(() => shell.popd());
        });
      } else utils.updateNetworkStatus(network, NETWORK_STATUS.failedToStart);
    });
  });
}
