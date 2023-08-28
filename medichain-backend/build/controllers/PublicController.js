import { errResponse, otherErrResponse } from "../errors/ApiError";
import errors from "../errors/GenericErrors";
import { organizationModel } from "../models/organization";
class PublicController {
    getAllEnrolledOrganizations = async (_req, res) => {
        try {
            const organizations = await organizationModel.find({ enrolled: true });
            const retrievedData = organizations.map(({ nameId, fullName }) => ({
                value: `${nameId} - ${fullName}`,
                label: fullName,
            }));
            return res.status(200).json(retrievedData);
        }
        catch (err) {
            if (err?.name === "CastError")
                return res.status(400).json(errResponse(errors.bad_input, `The netId/orgId is not valid or not correct`));
            return res.status(500).json(otherErrResponse(err));
        }
    };
}
export default new PublicController();
//# sourceMappingURL=PublicController.js.map