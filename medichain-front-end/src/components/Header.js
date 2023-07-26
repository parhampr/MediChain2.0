import { DoubleArrow, KeyboardArrowDown, Logout } from "@mui/icons-material";
import {
  AppBar,
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { Children, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AppThemeMode } from "../common/utils/stylesFunction";
import { useLogoutMutation } from "../features/auth/authApiSlice";
import { selectUserProps } from "../features/auth/authSlice";
import { selectIsThemeDark } from "../features/theme/themeSlice";
import logo from "../static/images/Logo.png";
import logo_dark from "../static/images/Logo_dark.png";

const useStylesHeaderClass = makeStyles((theme) => ({
  appBarStyle: {
    position: "sticky !important",
    top: 0,
    backgroundColor: `${theme.palette.primary.sectionContainer} !important`,
    color: `${theme.palette.text.primary} !important`,
    backgroundImage: "none !important",
  },

  appLogoClass: {
    margin: "auto",
    width: "38px !important",
    height: "38px !important",
    "& .MuiAvatar-img": {
      height: "25px !important",
      width: "fit-content !important",
    },
  },

  userChip: {
    "& .MuiChip-label": {
      textTransform: "capitalize",
      fontSize: "14px",
    },
    "& .MuiChip-avatar": {
      width: "35px !important",
      height: "35px !important",
      marginLeft: `0 !important`,
    },
  },
}));

export const Header = ({ children }) => {
  const classes = useStylesHeaderClass();
  const isDarkMode = useSelector(selectIsThemeDark);
  const userProps = useSelector(selectUserProps);
  const nav = useNavigate();
  const components = children ? Children.toArray(children) : null;
  const [ref, setRef] = useState(null);
  const onSetRef = (e) => setRef(e.currentTarget);
  const [logout, { isLoading }] = useLogoutMutation();

  return (
    <AppBar className={classes.appBarStyle}>
      <Toolbar>
        <Tooltip title="User Home">
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => nav(userProps.linkToHome)}
            aria-label="logo"
            sx={{ my: 1, mr: 1 }}
          >
            <Avatar alt="Logo" src={isDarkMode ? logo_dark : logo} className={classes.appLogoClass} />
          </IconButton>
        </Tooltip>
        <Box sx={{ flex: 1, display: "flex", alignItems: "center" }} component="div">
          <Typography variant="h5" component="span" sx={{ fontWeight: "bold" }}>
            Medi
          </Typography>
          <Typography variant="h5" component="span" sx={{ fontWeight: "bold", color: "primary.main" }}>
            Chain
          </Typography>
          <DoubleArrow sx={{ color: "text.primary", mx: 1 }} fontSize="inherit" />
          <Typography component="small" sx={{ fontWeight: "bold" }}>
            {userProps.headerLabel}
          </Typography>
        </Box>
        <AppThemeMode color="primary" sx={{ mr: 0.5 }} />
        {components && components[0]}
        <Tooltip title="You">
          <Chip
            className={classes.userChip}
            label={userProps.profileLabel}
            onClick={onSetRef}
            onDelete={onSetRef}
            avatar={<Avatar alt="Test User" src={userProps.profileSrc} />}
            deleteIcon={<KeyboardArrowDown />}
          />
        </Tooltip>
        <Menu
          anchorEl={ref}
          id="account-menu"
          open={Boolean(ref)}
          onClose={() => setRef(null)}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: "visible",
              filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
              mt: 1.5,
              "&:before": {
                content: '""',
                display: "block",
                position: "absolute",
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: "background.paper",
                transform: "translateY(-50%) rotate(45deg)",
                zIndex: 0,
              },
            },
          }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <MenuItem onClick={() => setRef(null)}>
            <Typography component="span" sx={{ fontSize: "13px", ml: 0.5 }}>
              <Typography sx={{ textAlign: "center", fontWeight: "bold" }}>Welcome, {userProps.welcomLabel}</Typography>
            </Typography>
          </MenuItem>
          {components && components[1]}
          <Divider />
          <MenuItem onClick={async () => await logout()} sx={{ textAlign: isLoading ? "center" : "start" }}>
            {isLoading ? (
              <ListItemText>
                <CircularProgress size={22} />
              </ListItemText>
            ) : (
              <>
                <ListItemIcon sx={{ color: "text.primary" }}>
                  <Logout fontSize="small" />
                </ListItemIcon>
                <ListItemText>Log Out</ListItemText>
              </>
            )}
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};
