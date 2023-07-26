"use strict";

import { ApiError } from "./apiError.class.js";

var errors = {};
export default errors;

errors.ApiError = ApiError;
//--------------------- GENERIC AUTH ERRORS -------------------------//
errors.not_found = new ApiError(400, "Required Fields Not Found");
errors.unauthorized_access = new ApiError(401, "Unauthorized Access");
errors.forbidden_access = new ApiError(403, "Forbidden Access");
errors.invalid_auth = new ApiError(401, "Invalid Authorization");
errors.maximum_organization_limit = new ApiError(429, "Organization Limit Reached").withDescription(
  "Maximum organization limit of 4 has been reached for you. Please upgrade before adding more"
);
errors.bad_input = new ApiError(400, "Input is not valid");
errors.bad_request_orgs = new ApiError(400, "Please make sure network is started/stopped to proceed");
errors.invalid_host_organization = new ApiError(401, "Unknown Host Organization");
errors.file_not_found = new ApiError(500, "Internal Server Error");
errors.duplicate_identity = new ApiError(204, "Duplicate Identity");
