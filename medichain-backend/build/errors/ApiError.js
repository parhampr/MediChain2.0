export class ApiError extends Error {
    status;
    name;
    description;
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
class ResponseHelper {
    static errResponse(errorObj, description) {
        if (!(errorObj instanceof ApiError))
            return { HTTP: 500, MESSAGE: "Unknown Error" };
        return {
            HTTP: errorObj.status,
            MESSAGE: errorObj.name,
            DESCRIPTION: description ? description : errorObj.description,
        };
    }
    static otherErrResponse(errObj) {
        if (errObj instanceof ApiError)
            return this.errResponse(errObj);
        return {
            HTTP: errObj?.status ? errObj.status : 500,
            MESSAGE: errObj?.name,
            DESCRIPTION: errObj?.message,
        };
    }
    static mongooseValidationErrors(errObj) {
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
                return null;
            default:
                return err;
        }
    }
}
export const errResponse = ResponseHelper.errResponse;
export const otherErrResponse = ResponseHelper.otherErrResponse;
export const mongooseValidationErrors = ResponseHelper.mongooseValidationErrors;
//# sourceMappingURL=ApiError.js.map