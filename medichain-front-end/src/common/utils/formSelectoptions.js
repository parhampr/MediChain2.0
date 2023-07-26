import { AccountCircle, AdminPanelSettings, LocalHospital, Person } from "@mui/icons-material";
import { ADMIN, DOCTOR, PATIENT, SUPER_ADMIN } from "../contants/userRoles";

export const maritalStatus = [
  { label: "Single", value: "single" },
  { label: "Married", value: "married" },
  { label: "Divorced", value: "divorced" },
  { label: "Legally Seperated", value: "legally seperated" },
  { label: "Widowed", value: "widowed" },
];

export const genderStatus = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Prefer not to say", value: "unknown" },
];

export const departmentSelectOptions = [
  { label: "General", value: "General" },
  { label: "Medicine", value: "Medicine" },
  { label: "Surgery", value: "Surgery" },
  { label: "Neurology", value: "Neurology" },
  { label: "Cardiology", value: "Cardiology" },
  { label: "Psychology", value: "Psychology" },
  { label: "Dermotology", value: "Dermotology" },
  { label: "ENT", value: "ENT" },
  { label: "Ophthalmology", value: "Ophthalmology" },
  { label: "Other", value: "Other" },
];

export const allLoginTypes = [
  { type: ADMIN, label: "Admin", icon: <AdminPanelSettings />, welcomeLabel: "Admin" },
  { type: PATIENT, label: "Patient", icon: <Person />, welcomeLabel: "User" },
  { type: DOCTOR, label: "Doctor", icon: <AccountCircle />, welcomeLabel: "Doctor" },
  { type: SUPER_ADMIN, label: "SuperAdmin", icon: <LocalHospital />, welcomeLabel: "Super-Admin" },
];
