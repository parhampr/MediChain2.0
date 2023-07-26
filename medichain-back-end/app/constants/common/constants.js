"use-strict";
export const p0PortAttribute = "p0port";
export const caPortAttribute = "caport";
export const couchPortAttribute = "couchport";
export const reservedAttribute = "reserved";

/* console constants */

// Colors
export const blackColor = `\x1b[30m`;
export const redColor = "\x1b[31m";
export const greenColor = "\x1b[32m"; // -- Used
export const yellowColor = "\x1b[33m";
export const blueColor = "\x1b[34m"; // -- Used
export const magentaColor = "\x1b[35m"; // -- Used
export const cyanColor = "\x1b[36m";
export const whiteColor = "\x1b[37m";
export const resetColor = "\x1b[0m"; // -- Used

// Clears
export const LINE_UP = "\x1b[1A";
export const LINE_CLEAR = "\x1b[2K";

export const GET_ONLY = {
  NETWORK: 0,
  ORGANIZATION: 1,
  STATUS: 2,
};
