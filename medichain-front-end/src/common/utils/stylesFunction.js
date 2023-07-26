import { DarkMode, ExpandCircleDown, LightMode, Close } from "@mui/icons-material";
import { Alert, Avatar, Box, CircularProgress, Divider, IconButton, Slide, Tooltip, Typography } from "@mui/material";
import { forwardRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectIsThemeDark, toggleThemeMode } from "../../features/theme/themeSlice";

export const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export const AppThemeMode = (iconButtonProps) => {
  const isDarkMode = useSelector(selectIsThemeDark);
  const dispatch = useDispatch();

  return (
    <Tooltip title={`Turn ${isDarkMode ? "on" : "off"} the light`}>
      <IconButton onClick={() => dispatch(toggleThemeMode())} aria-label="switch theme" {...iconButtonProps}>
        {isDarkMode ? <LightMode /> : <DarkMode />}
      </IconButton>
    </Tooltip>
  );
};

export const CollapseExpandButton = ({ tooltipTitle, iconColor, expanded, onClickBtn, sx = {} }) => {
  return (
    <Tooltip title={`${expanded ? "Collapse" : "Expand"} ${tooltipTitle}`}>
      <IconButton onClick={onClickBtn} color="inherit">
        <ExpandCircleDown
          fontSize="inherit"
          sx={{ transition: "0.25s", transform: `rotate(${expanded ? 180 : 0}deg)`, ...sx }}
          color={iconColor ?? "inherit"}
        />
      </IconButton>
    </Tooltip>
  );
};

export const LoadingProgress = ({ sx = {}, innerSx, alignX = "center", alignY = "center" }) => (
  <Box
    component={"div"}
    sx={{
      display: "flex",
      flexDirection: "column",
      justifyContent: alignY,
      alignItems: alignX,
      height: "100%",
      width: "100%",
      flex: 1,
      ...sx,
    }}
  >
    <CircularProgress sx={innerSx} />
  </Box>
);

export const EmptyDataVisualComp = ({ src, altSrc, title, subTitle }) => {
  return (
    <Box
      component={"div"}
      sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}
    >
      <Avatar alt={altSrc} src={src} sx={{ width: "150px !important", height: "150px", mt: 2, mb: 2 }} />
      <Typography component="span" variant="h6">
        <b>{title}</b>
      </Typography>
      <Typography component="small" sx={{ color: "text.secondary" }}>
        {subTitle}
      </Typography>
    </Box>
  );
};

export const SuperAdminHeadWrapper = ({ title, subTitle, icon, apiRefetch, children }) => (
  <Box component={"div"} sx={{ py: 4, px: 2, display: "flex", flexDirection: "column", height: "100%" }}>
    <Box component={"div"} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <Box component={"div"}>
        <Typography variant="h5" color={"primary"} fontWeight={600}>
          {title}
        </Typography>
        <Typography color={"text.primary"}>
          <b>{subTitle}</b>
        </Typography>
      </Box>
      <Tooltip title="reload">
        <IconButton color="primary" onClick={() => apiRefetch()}>
          {icon}
        </IconButton>
      </Tooltip>
    </Box>
    <Divider sx={{ my: 2 }} />
    {children}
  </Box>
);

export const AlertErrorComponent = ({ error, setError }) => {
  return (
    <Alert
      sx={{ my: 2 }}
      severity="error"
      action={
        <IconButton aria-label="close" color="inherit" size="small" onClick={() => setError(null)}>
          <Close fontSize="inherit" />
        </IconButton>
      }
    >
      <b>{error}</b>
    </Alert>
  );
};
