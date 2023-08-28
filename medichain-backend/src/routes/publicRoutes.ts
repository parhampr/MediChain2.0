import { PUBLIC_ROUTES } from "@Constant/Routes";
import PublicController from "@Controller/PublicController";
import { Router } from "express";

const router = Router();
router.get(PUBLIC_ROUTES.GET_ENROLLED, PublicController.getAllEnrolledOrganizations);

export default router;
