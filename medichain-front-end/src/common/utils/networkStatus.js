import { LoadingButton } from "@mui/lab";
import { Tooltip } from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { activeLoadingButtonProps } from "../../config/organizationsTableStructure";
import {
  useFetchNetworkStatusQuery,
  useStartNetworkMutation,
  useStopNetworkMutation,
} from "../../features/network/networkApiSlice";
import { setNotification } from "../../features/notifications/notificationSlice";
import { ERROR, SUCCESS } from "../contants/notification";
import { selectAllOrganizations, selectNetworkById } from "../../features/network/networkSlice";

export const NetworkStatusLoading = ({ id }) => {
  const network = useSelector((state) => selectNetworkById(state, id ?? "0"));
  const orgRows = useSelector(selectAllOrganizations).filter(
    ({ _id }) => network?.associatedOrgID?.includes(_id) ?? false
  );
  const dispatch = useDispatch();
  const [startQuery, setStartQuery] = useState(0);
  const { data: status, refetch } = useFetchNetworkStatusQuery(id, { pollingInterval: startQuery });
  const [startNetwork, { isLoading: isStartNetworkLoading }] = useStartNetworkMutation();
  const [stopNetwork, { isLoading: isStopNetworkLoading }] = useStopNetworkMutation();

  useEffect(() => {
    refetch();
  }, [refetch, network]);
  useEffect(() => {
    if (status?.code === 300) setStartQuery(() => 500);
    else setStartQuery(() => 0);
  }, [status]);

  useEffect(() => {
    if (startQuery === 500 && (status?.code === 500 || status?.code === 509))
      dispatch(
        setNotification(
          `Request to ${status.code === 500 ? "Start" : "Stop"} Network`,
          `${status.description} Please re-try again`,
          ERROR
        )
      );
  }, [startQuery, dispatch, status]);

  const toggleNetwork = (e) => {
    e.stopPropagation();
    switch (status?.code) {
      case 0:
      case 400:
      case 500:
        startNetwork({ netId: id })
          .unwrap()
          .then((res) => {
            refetch();
            dispatch(setNotification(res.message, `${res.description} Please wait for the network to start`, SUCCESS));
          });
        break;
      case 200:
      case 509:
        stopNetwork({ netId: id })
          .unwrap()
          .then((res) => {
            refetch();
            dispatch(setNotification(res.message, `${res.description}. Please wait for network to stop`, SUCCESS));
          });
        break;
      default:
        break;
    }
  };

  return (
    <Tooltip title={`${status?.description} ${status?.alternateDescription}`}>
      <span style={{ minWidth: "fit-content" }}>
        <LoadingButton
          variant="contained"
          {...activeLoadingButtonProps(status?.code, orgRows.length, isStartNetworkLoading, isStopNetworkLoading)}
          sx={{ fontWeight: "bolder", fontSize: "12px", textTransform: "capitalize" }}
          onClick={toggleNetwork}
        >
          <b>{status?.message}</b>
        </LoadingButton>
      </span>
    </Tooltip>
  );
};
