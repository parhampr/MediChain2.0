import { CheckCircle, Error, Info } from "@mui/icons-material";
import { Typography } from "@mui/material";
import { useStylesNotificationClassWithProps } from "../../classes/notifications/notificationClass";
import { ERROR, INFO, SUCCESS } from "../../common/contants/notification";

export const AlertIcon = ({ type, sx = {} }) => {
  const { iconStyle } = useStylesNotificationClassWithProps({ type });
  switch (type) {
    case SUCCESS:
      return <CheckCircle sx={{ ...iconStyle, ...sx }} />;
    case ERROR:
      return <Error sx={{ ...iconStyle, ...sx }} />;
    case INFO:
      return <Info sx={{ ...iconStyle, ...sx }} />;
    default:
      return null;
  }
};

export const AlertTitle = ({ type, title, sx = {} }) => {
  sx = { color: `${type}.main`, fontSize: "13.5px", ...sx };
  return (
    <Typography sx={sx}>
      <b>{title}</b>
    </Typography>
  );
};

export const AlertDescription = ({ type, description, sx = {} }) => {
  sx = { color: `${type}.primary`, fontSize: "12.5px", mt: 0.5, ...sx };
  return <Typography sx={sx}>{description}</Typography>;
};
