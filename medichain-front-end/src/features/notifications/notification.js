import { Close } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { Box } from "@mui/system";
import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  useStylesNotificationClassWithoutProps,
  useStylesNotificationClassWithProps,
} from "../../classes/notifications/notificationClass";
import { AlertDescription, AlertIcon, AlertTitle } from "./alertComponents";
import { destroyNotification, selectAllNotifications } from "./notificationSlice";

const Notification = ({ id, type, title, description, removeMaxTimer }) => {
  const [alertAnimationEnter, setAlertAnimationEnter] = useState(true);
  const [isHoveringOnIcon, setIsHoveringOnIcon] = useState(false);
  const classesWithProps = useStylesNotificationClassWithProps({ alertAnimationEnter, type, removeMaxTimer });
  const classesWithoutProps = useStylesNotificationClassWithoutProps();
  const dispatch = useDispatch();
  const handleMouseOver = () => setIsHoveringOnIcon(true);
  const handleMouseOut = () => setIsHoveringOnIcon(false);

  const closeAlert = useCallback(() => {
    setAlertAnimationEnter(false);
    setTimeout(() => dispatch(destroyNotification(id)), 1000);
  }, [dispatch, id]);

  useEffect(() => {
    const x = setTimeout(() => closeAlert(), removeMaxTimer);
    return () => clearTimeout(x);
  }, [closeAlert, removeMaxTimer]);

  return (
    <Box
      className={alertAnimationEnter ? classesWithoutProps.addAlert : classesWithoutProps.removeAlert}
      sx={classesWithProps.alertContainerProps}
      onMouseEnter={handleMouseOver}
      onMouseLeave={handleMouseOut}
    >
      <Box sx={classesWithProps.iconContainerStyle}>
        <IconButton onClick={isHoveringOnIcon ? closeAlert : () => {}}>
          {isHoveringOnIcon ? (
            <Close sx={{ ...classesWithProps.iconStyle, color: `${type}.main` }} />
          ) : (
            <AlertIcon type={type} sx={{ color: `${type}.main` }} />
          )}
        </IconButton>
      </Box>
      <Box className={classesWithoutProps.alertDescription}>
        <AlertTitle title={title} type={type} />
        <AlertDescription description={description} type={type} />
      </Box>
    </Box>
  );
};

export const NotificationStack = () => {
  const { notificationStackContainer } = useStylesNotificationClassWithoutProps();
  const notifications = useSelector(selectAllNotifications);
  return (
    <Box className={notificationStackContainer}>
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          id={notification.id}
          type={notification.type}
          title={notification.title}
          description={notification.description}
          removeMaxTimer={notification.maxTimer}
        />
      ))}
    </Box>
  );
};
