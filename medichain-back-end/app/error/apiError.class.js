"use strict";

/**
 * Used to create errors
 * @Param {Number} httpCode - http response code
 * @Param {String} name - Error name
 * @Param {String} description - Error description
 */
export class ApiError extends Error {
  constructor(status, name) {
    super();
    this.status = status;
    this.name = name;
    this.description = "None Provided";
  }
  withDescription(description) {
    this.description = description;
    return this;
  }
}

// JSON Response
const response = {
  errResponse: (errorObj) => ({
    HTTP: errorObj.status,
    MESSAGE: errorObj.name,
    DESCRIPTION: errorObj.description,
  }),
};

export const errResponse = (errObj, description) => {
  if (!(errObj instanceof ApiError)) return { MESSAGE: "Unknown Error" };
  return response.errResponse(errObj.withDescription(description ? description : errObj.description));
};

export const otherErrResponse = (errObj) => {
  if (errObj instanceof ApiError) return errResponse(errObj);
  return { HTTP: errObj?.status ? errObj.status : 500, MESSAGE: errObj.name, DESCRIPTION: errObj.message };
};

export const mongooseValidationErrors = (errObj) => {
  const err = { status: 500, name: errObj.name, message: errObj.message };
  switch (errObj.name) {
    case "ValidationError":
      err.status = 400;
      err.name = "Bad Request";
      err.message = errObj.message.split(": ")[2];
      return err;
    case "MongoServerError":
      err.status = 400;
      err.name = "Records Exists Error";
      if (err.message.includes("duplicate key error"))
        err.message = `Following field values already exists in database - [${Object.keys(errObj.keyValue)}]`;
    default:
      return err;
  }
};
