import { AUTH_ROUTES } from "@Constant/Routes";
import AuthController from "@Controller/AuthController";
import { Router } from "express";

const router = Router();

router.post(AUTH_ROUTES.LOGIN, AuthController.login);
router.post(AUTH_ROUTES.REFRESH, AuthController.refreshLogin);
router.post(AUTH_ROUTES.LOGOUT, AuthController.logout);

export default router;
