import { ArrowForward, Cached, ExpandCircleDown } from "@mui/icons-material";
import { Accordion, AccordionDetails, AccordionSummary, Grid, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useStylesNetworkDashboardClass } from "../../classes/network/networkDashboard";
import { ERROR, INFO, SUCCESS } from "../../common/constants/notification";
import { SUPER_ADMIN_ROUTES } from "../../common/constants/routesConstants";
import { NetworkStatusLoading } from "../../common/utils/networkStatus";
import {
  SuperAdminHeadWrapper,
  LoadingProgress,
  EmptyDataVisualComp,
  AlertErrorComponent,
} from "../../common/utils/stylesFunction";
import { createNetworkConfig, createNetworkErrorConfig, tablesAccordionConfig } from "../../config/createNetworkConfig";
import empty from "../../static/images/empty.jpg";
import { setNotification } from "../notifications/notificationSlice";
import { useCreateNetworkMutation, useFetchNetworkQuery } from "./networkApiSlice";
import { selectAllNetworks, selectAllOrganizations } from "./networkSlice";
import { AppForm } from "../../components/generalFormHelper";

const AccordionTableItems = ({ network, organizations, classes }) => {
  const [panelOpened, setPanelOpened] = useState("network-details");
  return tablesAccordionConfig(network, organizations).map((item, i) => (
    <Accordion
      key={i}
      className={classes.accordion}
      expanded={panelOpened === item.id}
      onClick={(e) => {
        e.stopPropagation();
        setPanelOpened(panelOpened === item.id ? null : item.id);
      }}
    >
      <AccordionSummary
        className={classes.accordionSummary}
        expandIcon={<ExpandCircleDown sx={{ color: "text.primary" }} />}
        aria-controls={`${item.id}-bh-content`}
        id={`${item.id}-bh-header`}
        sx={{ borderRadius: item.radius(panelOpened === item.id) }}
      >
        <Typography component={"small"}>
          <b>{item.title}</b>
          <Typography sx={{ color: "text.secondary" }}>
            <small>{item.subTitle}</small>
          </Typography>
        </Typography>
      </AccordionSummary>
      <AccordionDetails>{item.content}</AccordionDetails>
    </Accordion>
  ));
};

const NetworkGridItem = ({ network }) => {
  const organizations = useSelector(selectAllOrganizations).filter(({ _id }) => network.associatedOrgID.includes(_id));
  const classes = useStylesNetworkDashboardClass();
  const nav = useNavigate();
  return (
    <Grid item xs={12} md={8}>
      <Box
        component={"div"}
        className={classes.cardBoxContainer}
        onClick={() => nav(SUPER_ADMIN_ROUTES.networkDashboardOrganizationPage(network._id))}
      >
        <div className={classes.goNextArrow}>
          <ArrowForward className={classes.goArrow} fontSize={"22px"} sx={{ color: "text.reverse" }} />
        </div>
        <Box component={"div"} className={classes.cardBoxHeaderContainer}>
          <Box>
            <Typography fontWeight={600}>{network.name} - HLF Network</Typography>
            <Typography fontWeight={500} component="small" variant="small" sx={{ color: "text.secondary" }}>
              {network?.status?.description}
            </Typography>
          </Box>
          <NetworkStatusLoading id={network._id} />
        </Box>
        <Box component={"div"} sx={{ my: 2 }}>
          <AccordionTableItems network={network} organizations={organizations} classes={classes} />
        </Box>
      </Box>
    </Grid>
  );
};

const NewNetworkForm = ({ apiRefetch }) => {
  const dispatch = useDispatch();
  const [createNetwork] = useCreateNetworkMutation();
  const [err, setErr] = useState();

  const callSubmitApi = async (requestData) => {
    try {
      const response = await createNetwork(requestData).unwrap();
      dispatch(
        setNotification(
          `Network Created Successfully`,
          response?.data?.message ?? "New network was successfully created",
          SUCCESS
        )
      );
      apiRefetch();
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
        setErr(err.data.DESCRIPTION);
        if (err.status === 400) {
          dispatch(setNotification(err.data.MESSAGE, err.data.DESCRIPTION, INFO));
        } else if (err.status === 401) {
          dispatch(setNotification(err.data.MESSAGE, err.data.DESCRIPTION, ERROR));
        }
      }
    }
  };

  return (
    <AppForm
      accordions={createNetworkConfig}
      errorContent={createNetworkErrorConfig}
      apiFn={callSubmitApi}
      extraContent={err && <AlertErrorComponent error={err} setError={setErr} />}
    />
  );
};

export const NetworkDashboard = () => {
  const networks = useSelector(selectAllNetworks);
  const { isLoading: isLoadingNetwork, isFetching: isFetchingNetwork, refetch } = useFetchNetworkQuery();

  return (
    <SuperAdminHeadWrapper
      title={"Networks"}
      subTitle={"HyperLedger Fabric Network List"}
      icon={<Cached />}
      apiRefetch={refetch}
    >
      {isLoadingNetwork || isFetchingNetwork ? (
        <LoadingProgress />
      ) : networks.length === 0 ? (
        <>
          <NewNetworkForm apiRefetch={refetch} />
          <EmptyDataVisualComp
            src={empty}
            altSrc={"no networks available yet"}
            title={"No Fabric Networks Available yet"}
            subTitle={"Try creating a new fabric network using the form above"}
          />
        </>
      ) : (
        <Grid container spacing={2}>
          {networks.map((network, i) => (
            <NetworkGridItem key={i} network={network} />
          ))}
        </Grid>
      )}
    </SuperAdminHeadWrapper>
  );
};
