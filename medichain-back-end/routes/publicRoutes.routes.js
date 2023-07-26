import { Router } from "express";
import { getAllEnrolledOrganizations } from "../controllers/publicController.controller.js";
import { getAllEnrolledOrganizationsRouteString } from "../app/constants/routes/publicRouteStrings.js";

const router = Router();
router.get(getAllEnrolledOrganizationsRouteString, getAllEnrolledOrganizations);

export default router;
