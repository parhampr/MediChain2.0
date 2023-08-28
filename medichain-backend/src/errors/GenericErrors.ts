import { ApiError } from "./ApiError";

const errors = {
  not_found: new ApiError(400, "Required Fields Not Found"),
  unauthorized_access: new ApiError(401, "Unauthorized Access"),
  forbidden_access: new ApiError(403, "Forbidden Access"),
  invalid_auth: new ApiError(401, "Invalid Authorization"),
  maximum_organization_limit: new ApiError(429, "Organization Limit Reached").withDescription(
    "Maximum organization limit of 4 has been reached for you. Please upgrade before adding more",
  ),
  bad_input: new ApiError(400, "Input is not valid"),
  bad_request_orgs: new ApiError(400, "Please make sure network is started/stopped to proceed"),
  invalid_host_organization: new ApiError(404, "Unknown Host Organization"),
  file_not_found: new ApiError(500, "Internal Server Error"),
  duplicate_identity: new ApiError(204, "Duplicate Identity"),
};

export default errors;
