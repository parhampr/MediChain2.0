import { errResponse, otherErrResponse } from "@Error/ApiError";
import errors from "@Error/GenericErrors";
import { organizationModel } from "@Model/organization";
import { Request, Response } from "express";

class PublicController {
  public getAllEnrolledOrganizations = async (_req: Request, res: Response) => {
    try {
      const organizations = await organizationModel.find({ enrolled: true });
      const retrievedData = organizations.map(({ nameId, fullName }) => ({
        value: `${nameId} - ${fullName}`,
        label: fullName,
      }));
      return res.status(200).json(retrievedData);
    } catch (err: any) {
      if (err?.name === "CastError")
        return res.status(400).json(errResponse(errors.bad_input, `The netId/orgId is not valid or not correct`));
      return res.status(500).json(otherErrResponse(err));
    }
  };
}

export default new PublicController();
