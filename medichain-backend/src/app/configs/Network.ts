import { INetworkStatus } from "@Interfaces/models";

// Codes that determine network should not be touched == 200, 509, 300
// Codes that determine network elements can be changed == 0, 400, 500
export const NETWORK_STATUS: INetworkStatus = {
  // When organization length === 0
  unset: {
    code: 0,
    message: "Insufficient Organizations",
    description: "Organizations registered: 0.",
    alternateDescription: "Add more to start network",
  },

  // When organization length > 0 but network is new
  reset: {
    code: 0,
    message: "Not Started",
    description: "Network is not active.",
    alternateDescription: "Click to start the network",
  },

  pendingToStart: {
    code: 300,
    message: "Pending Start",
    description: "Network is starting.",
    alternateDescription: "...Please wait!",
  },

  pendingToStop: {
    code: 300,
    message: "Pending Stop",
    description: "Network is stopping.",
    alternateDescription: "...Please wait!",
  },

  started: {
    code: 200,
    message: "Network Started",
    description: "Network is active.",
    alternateDescription: "Click to stop the network",
  },

  failedToStart: {
    code: 500,
    message: "Failed to Start",
    description: "Network has failed to start.",
    alternateDescription: "Click to re-try",
  },

  stopped: {
    code: 400,
    message: "Network Stopped",
    description: "Network has stopped succesfully.",
    alternateDescription: "Click to start the network",
  },

  failedToStop: {
    code: 509,
    message: "Failed to Stop",
    description: "Network has failed to stop.",
    alternateDescription: "Click to re-try",
  },
};
