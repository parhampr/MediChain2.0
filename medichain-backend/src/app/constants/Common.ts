export const PORT_ATTRIBUTES = {
  p0Port: "p0port",
  caPort: "caport",
  couchPort: "couchport",
  reserved: "reserved",
} as const;

export const ROLE = {
  superAdmin: "superadmin",
  admin: "admin",
  patient: "patient",
  doctor: "doctor",
} as const;

export const GET_ATTRIBUTES = {
  NETWORK: 0,
  ORGANIZATION: 1,
  STATUS: 2,
} as const;
