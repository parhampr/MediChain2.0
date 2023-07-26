import { makeStyles } from "@mui/styles";

export const useStylesNotificationClassWithoutProps = makeStyles((theme) => ({
  addAlert: {
    transition: "0.5s",
    transform: "translate3d(1000px, 0, 0)",
    animation: "shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both",
    animationDelay: "200ms",
    backfaceVisibility: "hidden",
    perspective: "1000px",
  },
  removeAlert: {
    transition: "0.5s",
    animation: "unshake 1s cubic-bezier(0.36, 0.07, 0.19, 0.97) both",
    animationDelay: "200ms",
    transform: "translate3d(0, 0, 0)",
    backfaceVisibility: "hidden",
    perspective: "1000px",
  },
  alertDescription: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "start",
    margin: theme.spacing(1),
  },

  notificationStackContainer: {
    position: "fixed",
    right: 0,
    top: "70px",
    paddingLeft: "32px",
    width: "fit-content",
    height: "fit-content",
    maxHeight: "100%",
    overflow: "hidden",
    zIndex: theme.zIndex.snackbar,
    display: "flex",
    alignItems: "flex-end",
    flexDirection: "column",
  },
}));
export const useStylesNotificationClassWithProps = (props) => ({
  alertContainerProps: {
    boxShadow: "rgb(0 0 0 / 27%) 0px 2px 3px 2px",
    borderRadius: "60px 0 0 60px",
    display: "flex",
    alignItems: "center",
    marginTop: 2,
    marginBottom: 1,
    width: "400px",
    transform: `translate3d(${props.alertAnimationEnter ? 1000 : 0}px, 0, 0)`,
    backgroundColor: "primary.sectionContainer",
    float: "right",
    borderLeft: "2px solid",
    borderLeftColor: `${props.type}.main`,

    "&::after": props.alertAnimationEnter
      ? {
          content: '""',
          position: "absolute",
          bottom: "-2px",
          right: 0,
          width: "93%",
          height: "2px",
          backgroundColor: `${props.type}.main`,
          animation: `closeEaseTransition ${props.removeMaxTimer}ms ease-in-out both`,
        }
      : {},
  },

  iconContainerStyle: {
    minHeight: "60px",
    minWidth: "60px",
    borderRadius: "60px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: `${props.type}.secondary`,
    margin: 0.5,
  },

  iconStyle: {
    color: `${props.type}.main !important`,
    width: "40px",
    height: "40px",
  },
});
