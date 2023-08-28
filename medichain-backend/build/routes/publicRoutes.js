import { PUBLIC_ROUTES } from "../app/constants/Routes";
import PublicController from "../controllers/PublicController";
import { Router } from "express";
const router = Router();
router.get(PUBLIC_ROUTES.GET_ENROLLED, PublicController.getAllEnrolledOrganizations);
export default router;
//# sourceMappingURL=publicRoutes.js.map