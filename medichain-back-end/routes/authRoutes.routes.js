import { Router } from "express";
import {
  loginAuthRouteString,
  logoutAuthRouteString,
  refreshTokenAuthRouteString,
} from "../app/constants/routes/authRouteStrings.js";
import {
  handleLoginForUser,
  handleLogoutForUser,
  handleRefreshLoginForUser,
} from "../controllers/authController.controller.js";

const router = Router();

router.post(loginAuthRouteString, handleLoginForUser);
router.post(refreshTokenAuthRouteString, handleRefreshLoginForUser);
router.post(logoutAuthRouteString, handleLogoutForUser);

export default router;
