import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import { AlertErrorComponent, LoadingProgress, Transition } from "../../../common/utils/stylesFunction";
import { AppForm } from "../../../components/generalFormHelper";
import { createOrganizationConfig, createOrganizationErrorConfig } from "../../../config/createOrganizationConfig";
import { Fragment, useState } from "react";
import { Close } from "@mui/icons-material";
import { useDispatch } from "react-redux";
import { setNotification } from "../../notifications/notificationSlice";
import { ERROR, INFO, SUCCESS } from "../../../common/contants/notification";
import { useParams } from "react-router-dom";
import {
  useCreateOrganizationMutation,
  useEnrollOrganizationMutation,
  useDeleteOrganizationMutation,
  useLazyFetchSingleNetworkQuery,
} from "../networkApiSlice";

export const DeleteOrganizationDialogForm = ({ closeDialogBox, extraArgs: { selected, setSelected } }) => {
  const { netId } = useParams();
  const [loading, setLoading] = useState(false);
  const [triggerDelete] = useDeleteOrganizationMutation();
  const [triggerUpdateTable] = useLazyFetchSingleNetworkQuery();

  const closeDialog = () => {
    if (!loading) {
      setSelected(() => []);
      closeDialogBox();
    }
  };

  const deleteOrganizations = async () => {
    setLoading(true);
    for (const orgId of selected) await triggerDelete({ netId, orgId });
    await triggerUpdateTable(netId);
    setLoading(false);
    setSelected([]);
  };

  return (
    <Dialog
      open={true}
      onClose={closeDialog}
      TransitionComponent={Transition}
      PaperProps={{
        sx: {
          bgcolor: "background.default",
          backgroundImage: "none",
        },
      }}
    >
      <DialogTitle>Do you really want to delete selected hospital(s)?</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-slide-description">
          Please be aware than you cannot recover these deleted hospital organizations. Do you wish to go forward with
          this?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        {loading ? (
          <LoadingProgress alignX="end" innerSx={{ mr: 0.5, mb: 0.5 }} />
        ) : (
          <Fragment>
            <Button sx={{ fontWeight: "bold" }} onClick={closeDialog}>
              Cancel
            </Button>
            <Button sx={{ fontWeight: "bold" }} onClick={deleteOrganizations}>
              Delete
            </Button>
          </Fragment>
        )}
      </DialogActions>
    </Dialog>
  );
};

export const EnrollOrganizationDialogForm = ({ closeDialogBox, extraArgs: { selected, setSelected } }) => {
  const { netId } = useParams();
  const [loading, setLoading] = useState(false);
  const [triggerEnroll] = useEnrollOrganizationMutation();
  const [triggerUpdateTable] = useLazyFetchSingleNetworkQuery();

  const closeDialog = () => {
    if (!loading) {
      setSelected(() => []);
      closeDialogBox();
    }
  };

  const enrollOrganizations = async () => {
    setLoading(true);
    for (const orgId of selected) await triggerEnroll({ netId, orgId });
    await triggerUpdateTable(netId);
    setLoading(false);
    setSelected([]);
  };

  return (
    <Dialog
      maxWidth="md"
      open={true}
      onClose={closeDialog}
      TransitionComponent={Transition}
      PaperProps={{
        sx: {
          bgcolor: "background.default",
          backgroundImage: "none",
        },
      }}
    >
      <DialogTitle>Enroll Organizations</DialogTitle>
      <DialogContent>
        Please be aware that enrolling hospital organizations into the blockchain network will enable then active. These
        hospitals will be able to update blockchain network
      </DialogContent>
      <DialogActions>
        {loading ? (
          <LoadingProgress alignX="end" innerSx={{ mr: 0.5, mb: 0.5 }} />
        ) : (
          <Fragment>
            <Button sx={{ fontWeight: "bold" }} onClick={closeDialog}>
              Cancel
            </Button>
            <Button sx={{ fontWeight: "bold" }} onClick={enrollOrganizations}>
              Enroll
            </Button>
          </Fragment>
        )}
      </DialogActions>
    </Dialog>
  );
};

export const CreateOrganizationDialogForm = ({ closeDialogBox }) => {
  const dispatch = useDispatch();
  const { netId } = useParams();
  const [fetchSingleNetwork] = useLazyFetchSingleNetworkQuery();
  const [submitRunning, setSubmitRunning] = useState(false);
  const [err, setErr] = useState();
  const [createOrganization] = useCreateOrganizationMutation();
  const closeDialog = () => {
    if (!submitRunning) closeDialogBox();
  };

  const onSubmit = async (requestData) => {
    setSubmitRunning(true);
    requestData["netId"] = netId;
    try {
      const response = await createOrganization(requestData).unwrap();
      dispatch(
        setNotification(
          `Organization Created Succesfully`,
          response?.data?.message ?? "New organization was successfully created",
          SUCCESS
        )
      );
      fetchSingleNetwork(netId);
    } catch (err) {
      if (!err?.data) {
        dispatch(
          setNotification(
            "Connection Error",
            "There was a problem connecting to the server. Please try again later",
            ERROR
          )
        );
      } else {
        setErr(err.data.DESCRIPTION ?? err.data.MESSAGE);
        if (err.status === 400 || err.status === 300) {
          dispatch(setNotification(err.data.MESSAGE, err.data.DESCRIPTION, INFO));
        } else {
          dispatch(setNotification(err.data.MESSAGE, err.data.DESCRIPTION, ERROR));
        }
      }
    } finally {
      setSubmitRunning(false);
    }
  };

  return (
    <Dialog
      maxWidth="md"
      open={true}
      onClose={closeDialog}
      TransitionComponent={Transition}
      PaperProps={{
        sx: {
          bgcolor: "background.default",
          backgroundImage: "none",
        },
      }}
    >
      <DialogTitle sx={{ textAlign: "center" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Create a new hospital organization</span>
          <Tooltip title={"Close"}>
            <IconButton variant="contained" onClick={closeDialog} sx={{ color: "text.primary" }}>
              <Close />
            </IconButton>
          </Tooltip>
        </Box>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <AppForm
          accordions={createOrganizationConfig}
          errorContent={createOrganizationErrorConfig}
          extraContent={err && <AlertErrorComponent error={err} setError={setErr} />}
          loadingButtonTitle={"Add Hospital"}
          openOneAtTime={true}
          apiFn={onSubmit}
        >
          <Typography component="span" variant="h6" sx={{ "& .MuiTypography-root": { color: "text.secondary" } }}>
            <Typography>
              <small>
                This information should be filled out as precisely as possible and ensure the hospital is aware of this
                information.
              </small>
            </Typography>
            <Typography>
              <small>
                <em>* There are 2 parts of this form listed below. Both are required.</em>
              </small>
            </Typography>
          </Typography>
        </AppForm>
      </DialogContent>
    </Dialog>
  );
};
