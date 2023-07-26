import { Outlet } from "react-router-dom";
import { NotificationStack } from "../features/notifications/notification";

export const Layout = () => {
  return (
    <>
      <NotificationStack />
      <Outlet />
    </>
  );
};
