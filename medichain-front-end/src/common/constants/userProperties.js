import Admin from "../../static/images/admin.png";
import { ADMIN_ROUTES, DOCTOR_ROUTES, PATIENT_ROUTES, SUPER_ADMIN_ROUTES } from "../constants/routesConstants";
import { AccountCircle, AdminPanelSettings, LocalHospital, Person } from "@mui/icons-material";

export const ROLE = {
  SUPER_ADMIN: "superadmin",
  ADMIN: "admin",
  PATIENT: "patient",
  DOCTOR: "doctor",
};

export const allLoginTypes = [
  { type: ROLE.ADMIN, label: "Admin", icon: <AdminPanelSettings />, welcomeLabel: "Admin" },
  { type: ROLE.PATIENT, label: "Patient", icon: <Person />, welcomeLabel: "User" },
  { type: ROLE.DOCTOR, label: "Doctor", icon: <AccountCircle />, welcomeLabel: "Doctor" },
  { type: ROLE.SUPER_ADMIN, label: "SuperAdmin", icon: <LocalHospital />, welcomeLabel: "Super-Admin" },
];

export const USER_PROPS = {
  [ROLE.SUPER_ADMIN]: {
    routes: Object.values(SUPER_ADMIN_ROUTES).map((value) => (typeof value === "function" ? value() : value)),
    linkToHome: SUPER_ADMIN_ROUTES.networkDashboard,
    headerLabel: "Blockchain Network",
    profileLabel: "S-Admin",
    profileSrc: Admin,
    welcomeLabel: allLoginTypes.find((item) => item.type === ROLE.SUPER_ADMIN).welcomeLabel,
  },
  [ROLE.ADMIN]: {
    routes: Object.values(ADMIN_ROUTES).map((value) => (typeof value === "function" ? value() : value)),
  },
  [ROLE.DOCTOR]: {
    routes: Object.values(DOCTOR_ROUTES).map((value) => (typeof value === "function" ? value() : value)),
  },
  [ROLE.PATIENT]: {
    routes: Object.values(PATIENT_ROUTES).map((value) => (typeof value === "function" ? value() : value)),
  },
};
