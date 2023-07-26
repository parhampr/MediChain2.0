"use-strict";
import shell from "shelljs";
import {
  shellExecuteStartNetwork,
  shellExecuteStopNetwork,
  shellFindConfigLocation,
} from "../../app/constants/config/shellCommand.js";
import { generateConfigFileName, networkAppDirectory } from "../../app/constants/config/env.js";
import { shellStringToGenerateConfig, updateNetworkStatus } from "../../app/utils/utilsFns.js";
import { networkStatus } from "../../app/constants/model/networkStatusConstants.js";

const execSilently = (execCommandFn) => {
  shell.config.silent = true;
  execCommandFn();
  shell.config.silent = false;
};

export function stopHLFNetwork(network) {
  execSilently(() => shell.pushd(networkAppDirectory));
  shell.exec(shellExecuteStopNetwork, function (executeStopNetworkCode) {
    updateNetworkStatus(network, executeStopNetworkCode === 0 ? networkStatus.stopped : networkStatus.failedToStop);
    execSilently(() => shell.popd());
  });
}

export function generateAndRunNetworkConfiguration(network) {
  shell.exec(shellFindConfigLocation, function (_, stdout) {
    execSilently(() => shell.pushd(stdout.trim()));
    shell.exec(`${generateConfigFileName} ${shellStringToGenerateConfig(network)}`, function (configGenerationCode) {
      execSilently(() => shell.popd());
      if (configGenerationCode === 0) {
        execSilently(() => shell.pushd(networkAppDirectory));
        shell.exec(shellExecuteStartNetwork, function (executeStartNetworkCode) {
          updateNetworkStatus(
            network,
            executeStartNetworkCode === 0 ? networkStatus.started : networkStatus.failedToStart
          );
          execSilently(() => shell.popd());
        });
      } else updateNetworkStatus(network, networkStatus.failedToStart);
    });
  });
}
