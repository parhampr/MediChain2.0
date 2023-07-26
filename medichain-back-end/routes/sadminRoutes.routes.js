import { Router } from "express";
import {
  createNetworkSAdminRouteString,
  createOrganizationSAdminRouteString,
  deleteOrganizationSAdminRouteString,
  enrollOrganizationSAdminRouteString,
  fetchWholeNetworkSAdminRouteString,
  startHLFNetworkSAdminRouteString,
  stopHLFNetworkSAdminRouteString,
} from "../app/constants/routes/sadminRouteStrings.js";
import {
  createNetworkWithSuperAdmin,
  createOrganizationWithSuperAdmin,
  deleteOrganizationWithSuperAdmin,
  enrollOrganizationWithSuperAdmin,
  fetchWholeNetworkWithSuperAdmin,
  startHLFNetworkWithSuperAdmin,
  stopHLFNetworkWithSuperAdmin,
} from "../controllers/sAdminController.controller.js";

const router = Router();

router.get(fetchWholeNetworkSAdminRouteString, fetchWholeNetworkWithSuperAdmin);
router.post(createNetworkSAdminRouteString, createNetworkWithSuperAdmin);
router.post(createOrganizationSAdminRouteString, createOrganizationWithSuperAdmin);
router.post(enrollOrganizationSAdminRouteString, enrollOrganizationWithSuperAdmin);
router.post(startHLFNetworkSAdminRouteString, startHLFNetworkWithSuperAdmin);
router.post(stopHLFNetworkSAdminRouteString, stopHLFNetworkWithSuperAdmin);
router.delete(deleteOrganizationSAdminRouteString, deleteOrganizationWithSuperAdmin);

export default router;
