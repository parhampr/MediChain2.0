import { SUPER_ADMIN_ROUTES } from "@Constant/Routes";
import SAdminController from "@Controller/SAdminController";
import { Router } from "express";

const router = Router();

router.get(SUPER_ADMIN_ROUTES.FETCH_NETWORK, SAdminController.fetchWholeNetworkWithSuperAdmin);
router.post(SUPER_ADMIN_ROUTES.CREATE_NETWORK, SAdminController.createNetworkWithSuperAdmin);
router.post(SUPER_ADMIN_ROUTES.CREATE_ORGANIZATION, SAdminController.createOrganizationWithSuperAdmin);
router.post(SUPER_ADMIN_ROUTES.ENROLL_ORGANIZATION, SAdminController.enrollOrganizationWithSuperAdmin);
router.post(SUPER_ADMIN_ROUTES.START_NETWORK, SAdminController.startHLFNetworkWithSuperAdmin);
router.post(SUPER_ADMIN_ROUTES.STOP_NETWORK, SAdminController.stopHLFNetworkWithSuperAdmin);
router.delete(SUPER_ADMIN_ROUTES.DELETE_ORGANIZATION, SAdminController.deleteOrganizationWithSuperAdmin);

export default router;
