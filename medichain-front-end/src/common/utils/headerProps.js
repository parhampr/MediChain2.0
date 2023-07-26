import { SUPER_ADMIN } from "../contants/userRoles";
import Admin from "../../static/images/admin.png";
import { networkDashboard } from "../contants/routesConstants";
import { allLoginTypes } from "./formSelectoptions";

export const userProps = (key) => {
  switch (key) {
    case SUPER_ADMIN:
      return {
        linkToHome: networkDashboard,
        headerLabel: "Blockchain Network",
        profileLabel: "S-Admin",
        profileSrc: Admin,
        welcomLabel: allLoginTypes.find((item) => item.type === SUPER_ADMIN).welcomeLabel,
      };
    default:
      break;
  }
};
