import { AUTH_ROUTES } from "../app/constants/Routes";
import AuthController from "../controllers/AuthController";
import { Router } from "express";
const router = Router();
router.post(AUTH_ROUTES.LOGIN, AuthController.login);
router.post(AUTH_ROUTES.REFRESH, AuthController.refreshLogin);
router.post(AUTH_ROUTES.LOGOUT, AuthController.logout);
export default router;
//# sourceMappingURL=authRoutes.js.map