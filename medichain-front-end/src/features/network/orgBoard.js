import { useNavigate, useParams } from "react-router-dom";
import { useFetchSingleNetworkQuery, useLazyFetchNetworkStatusQuery } from "./networkApiSlice";
import { EmptyDataVisualComp, LoadingProgress, SuperAdminHeadWrapper } from "../../common/utils/stylesFunction";
import { Cached } from "@mui/icons-material";
import emptyTable from "../../static/images/emptyTable.webp";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Checkbox,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { useStylesOrganizationTableClass } from "../../classes/network/organizationTable";
import { useDispatch, useSelector } from "react-redux";
import { selectAllOrganizations, selectNetworkById } from "./networkSlice";
import {
  ascendingOrder,
  defaultOrderBy,
  descendingOrder,
  getComparator,
  headCellsIdentities,
  stableSort,
  subHeadBodyConfig,
  tableButtons,
} from "../../config/organizationsTableStructure";
import { Fragment, memo, useCallback, useMemo, useState } from "react";
import { networkDashboard } from "../../common/contants/routesConstants";
import { visuallyHidden } from "@mui/utils";
import {
  CreateOrganizationDialogForm,
  DeleteOrganizationDialogForm,
  EnrollOrganizationDialogForm,
} from "./dialogContent/tableOrgForms";
import { NetworkStatusLoading } from "../../common/utils/networkStatus";
import { ERROR, INFO, SUCCESS } from "../../common/contants/notification";
import { setNotification } from "../notifications/notificationSlice";

function ButtonDialogBox({ buttonProps, ForwardComponent = () => {}, extraArgs = {} }) {
  const { netId } = useParams();
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [triggerStatusQuery] = useLazyFetchNetworkStatusQuery();

  const openDialog = async () => {
    dispatch(setNotification("Checking to approve request", `Please wait for the network to respond`, INFO));
    const { data } = await triggerStatusQuery(netId ?? 0);

    if (data) {
      if (data.code === 300) {
        dispatch(
          setNotification("Request Denied", `Please wait for the blockchain network to complete processing`, ERROR)
        );
        return;
      }

      switch (buttonProps.buttonAction) {
        case "DELETE":
        case "ADD":
          if (data.code === 0 || data.code === 400 || data.code === 500) {
            dispatch(setNotification("Request Approved", `You may proceed to do add/delete hospitals`, SUCCESS));
            setOpen(true);
          } else dispatch(setNotification("Request Denied", `Please stop the network to add/delete hospitals`, ERROR));
          break;
        case "ENROLL":
          if (data.code === 200 || data.code === 509) {
            dispatch(setNotification("Request Approved", `You may proceed to do enroll hospitals`, SUCCESS));
            setOpen(true);
          } else dispatch(setNotification("Request Denied", `Please start the network to enroll new hospitals`, ERROR));
          break;
        default:
          return;
      }
    } else {
      dispatch(
        setNotification("Request Denied : Timeout", `Please check your internet connection and try again`, ERROR)
      );
    }
  };

  const buttonStyleProps = {
    variant: "contained",
    onClick: openDialog,
    color: buttonProps.color,
    sx: {
      fontWeight: "bolder",
      minWidth: "fit-content",
      ml: 1,
      textTransform: "capitalize",
    },
  };

  return (
    <Fragment>
      {open && <ForwardComponent closeDialogBox={() => setOpen(false)} extraArgs={extraArgs} />}
      <Tooltip title={buttonProps.title}>
        {buttonProps.type === "icon" ? (
          <IconButton {...buttonStyleProps}>{buttonProps.render}</IconButton>
        ) : (
          <Button {...buttonStyleProps}>{buttonProps.render}</Button>
        )}
      </Tooltip>
    </Fragment>
  );
}

const MemoizedOrganizationTableToolBar = memo(({ selected, setSelected }) => {
  const { netId } = useParams();
  const numSelected = selected.length;
  return (
    <Toolbar
      sx={{
        padding: 2,
        minHeight: "78px !important",
        borderRadius: "12px 12px 0 0",
        ...(numSelected > 0 && {
          bgcolor: "primary.secondarySectionContainer",
        }),
      }}
    >
      {numSelected > 0 ? (
        <>
          <Typography sx={{ flex: "1 1 100%", fontWeight: "bold" }} color="inherit" variant="subtitle1" component="div">
            {numSelected} selected
          </Typography>
          <ButtonDialogBox
            buttonProps={tableButtons.ENROLL_ORG}
            ForwardComponent={EnrollOrganizationDialogForm}
            extraArgs={{ selected, setSelected }}
          />
          <ButtonDialogBox
            buttonProps={tableButtons.DELETE_ORG}
            ForwardComponent={DeleteOrganizationDialogForm}
            extraArgs={{ selected, setSelected }}
          />
        </>
      ) : (
        <>
          <Typography sx={{ flex: "1 1 100%", fontWeight: "bold" }} variant="h6" id="tableTitle" component="div">
            Hospitals Enrolled
          </Typography>
          <Typography
            sx={{
              minWidth: "fit-content",
              mr: 2,
              fontWeight: "bold",
            }}
          >
            Network Status :
          </Typography>
          <NetworkStatusLoading id={netId} />
          <ButtonDialogBox buttonProps={tableButtons.ADD_ORG} ForwardComponent={CreateOrganizationDialogForm} />
        </>
      )}
    </Toolbar>
  );
});
const MemoizedOrganizationTableHead = memo(
  ({ onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort }) => (
    <TableHead sx={{ backgroundColor: "primary.sectionContainer" }}>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={(e) => onSelectAllClick(e)}
            inputProps={{
              "aria-label": "select or de-select all hospitals",
            }}
          />
        </TableCell>
        {headCellsIdentities.map(({ id, align, disablePadding, label }) => (
          <TableCell
            key={id}
            align={align}
            padding={disablePadding ? "none" : "normal"}
            sortDirection={orderBy === id ? order : false}
          >
            <TableSortLabel
              active={orderBy === id}
              direction={orderBy === id ? order : ascendingOrder}
              onClick={() => onRequestSort(id)}
            >
              <Typography sx={{ color: "text.secondary", fontWeight: "bolder" }}>{label}</Typography>
              {orderBy === id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === descendingOrder ? "Sorted Descending" : "Sorted ascending"}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  )
);

const MemoizedRow = memo(({ row, isItemSelected, handleSelectSingleClick, rowExpand, handleRowCollapse }) => {
  return (
    <>
      <TableRow
        hover
        onClick={() => handleSelectSingleClick(row._id)}
        aria-checked={isItemSelected}
        tabIndex={-1}
        selected={isItemSelected}
        sx={{ "&.MuiTableRow-root.Mui-selected": { bgcolor: "primary.secondarySectionContainer" } }}
      >
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            checked={isItemSelected}
            inputProps={{ "aria-labelledby": `enhanced-table-checkbox-${row._id}` }}
          />
        </TableCell>
        {headCellsIdentities.map(({ align, disablePadding, id: colId, renderContent, onClickCell }) => (
          <TableCell
            align={align}
            padding={disablePadding ? "none" : "normal"}
            key={`${row._id}-${colId}`}
            style={{ paddingRight: align === "center" ? "36px" : "16px" }}
            onClick={
              onClickCell
                ? (e) => {
                    e.stopPropagation();
                    onClickCell(rowExpand, handleRowCollapse);
                  }
                : null
            }
          >
            {renderContent(colId === "expand" ? rowExpand : row[colId])}
          </TableCell>
        ))}
      </TableRow>
      <TableRow>
        <TableCell colSpan={7} padding={"none"} sx={{ borderBottom: 0 }}>
          <Collapse in={rowExpand.isExpanded} timeout="auto" unmountOnExit>
            <TableContainer sx={{ backgroundColor: "primary.sectionContainer", borderRadius: "0 0 10px 10px" }}>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell padding={"none"} align={"center"} sx={{ borderBottom: 0, width: "40%" }}>
                      <Typography>More Details for {row["nameId"]}</Typography>
                    </TableCell>
                    <TableCell padding={"none"} sx={{ borderBottom: 0 }}>
                      <TableContainer>
                        <Table aria-labelledby={`hospital organization details-${row._id}`}>
                          <TableBody>
                            {subHeadBodyConfig.map((eBody, indexI) => (
                              <TableRow key={`${row._id}-${eBody.id}-${indexI}`}>
                                <TableCell
                                  align={eBody.alignCell1}
                                  padding={eBody.disablePaddingCell1 ? "none" : "normal"}
                                  sx={{
                                    borderBottomWidth: indexI === subHeadBodyConfig.length - 1 ? 0 : "1px",
                                  }}
                                >
                                  {eBody.label}
                                </TableCell>
                                <TableCell
                                  align={eBody.alignCell2}
                                  padding={eBody.disablePaddingCell2 ? "none" : "normal"}
                                  sx={{
                                    borderBottomWidth: indexI === subHeadBodyConfig.length - 1 ? 0 : "1px",
                                  }}
                                >
                                  : <b>{eBody.render ? eBody.render(row) : row[eBody.id]}</b>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
});

function OrganizationTable({ page, rowsPerPage, dataRows }) {
  const classess = useStylesOrganizationTableClass();

  const [collapsed, setCollapsed] = useState(() => {
    const content = {};
    dataRows.forEach(({ _id }) => {
      content[_id] = { rowId: _id, isExpanded: false };
    });
    return content;
  });
  const [selected, setSelected] = useState([]);

  const [order, setOrder] = useState(ascendingOrder);
  const [orderBy, setOrderBy] = useState(defaultOrderBy);

  const handleRequestSort = useCallback(
    (columnId) => {
      // Toggle Asc to Desc
      setOrder(orderBy === columnId && order === ascendingOrder ? descendingOrder : ascendingOrder);
      setOrderBy(columnId);
    },
    [orderBy, order]
  );

  // Either Select All or Deselect All
  const handleSelectAllClick = useCallback(
    (event) => setSelected(() => (event.target.checked ? dataRows.map((row) => row._id) : [])),
    [dataRows]
  );

  const handleSelectSingleClick = useCallback((rowId) => {
    setSelected((prevSelected) => {
      const selectedIndex = prevSelected.indexOf(rowId);
      let newSelected = [];
      if (selectedIndex === -1) newSelected = newSelected.concat(prevSelected, rowId);
      else if (selectedIndex === 0) newSelected = newSelected.concat(prevSelected.slice(1));
      else if (selectedIndex === prevSelected.length - 1) newSelected = newSelected.concat(prevSelected.slice(0, -1));
      else if (selectedIndex > 0)
        newSelected = newSelected.concat(prevSelected.slice(0, selectedIndex), prevSelected.slice(selectedIndex + 1));
      return newSelected;
    });
  }, []);

  const handleRowCollapse = useCallback((rowId) => {
    setCollapsed((prevCollapsed) => ({
      ...prevCollapsed,
      [rowId]: { ...prevCollapsed[rowId], isExpanded: !prevCollapsed[rowId].isExpanded },
    }));
  }, []);

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - dataRows.length) : 0;

  const memoizedRowComponents = useMemo(() => {
    const slicedData = stableSort(dataRows, getComparator(order, orderBy)).slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );

    return slicedData.map((row) => (
      <MemoizedRow
        key={row._id}
        row={row}
        isItemSelected={selected.indexOf(row._id) !== -1}
        rowExpand={collapsed[row._id]}
        handleSelectSingleClick={handleSelectSingleClick}
        handleRowCollapse={handleRowCollapse}
      />
    ));
  }, [page, rowsPerPage, dataRows, order, orderBy, handleSelectSingleClick, handleRowCollapse, selected, collapsed]);

  return (
    <>
      <MemoizedOrganizationTableToolBar selected={selected} setSelected={setSelected} />
      <TableContainer className={classess.outermostTableContainer}>
        <Table sx={{ minWidth: 650 }} aria-labelledby="hospital organizations">
          <MemoizedOrganizationTableHead
            numSelected={selected.length}
            onRequestSort={handleRequestSort}
            onSelectAllClick={handleSelectAllClick}
            order={order}
            orderBy={orderBy}
            rowCount={dataRows.length}
          />
          <TableBody>
            {memoizedRowComponents}
            {emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={6} />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

function OrganizationBoardWithPagination() {
  const { netId } = useParams();
  const network = useSelector((state) => selectNetworkById(state, netId ?? "0"));
  const dataRows = useSelector(selectAllOrganizations).filter(({ _id }) => network?.associatedOrgID?.includes(_id));

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = useCallback((_, newPage) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  return (
    <>
      <OrganizationTable page={page} rowsPerPage={rowsPerPage} dataRows={dataRows} />
      {dataRows.length < 1 && (
        <EmptyDataVisualComp
          src={emptyTable}
          altSrc={"No Organizations Registered"}
          title={"No Hospital Organizations Available yet"}
          subTitle={"Try creating a new hospital organization by clicking the plus sign above"}
        />
      )}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={dataRows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </>
  );
}

export const OrganizationTableBoard = () => {
  const { netId } = useParams();
  const navigate = useNavigate();
  const {
    isLoading: isLoadingNetwork,
    isError,
    isFetching: isFetchingNetwork,
    refetch,
  } = useFetchSingleNetworkQuery(netId);
  return (
    <SuperAdminHeadWrapper
      title={"Hospital Organizations"}
      subTitle={`HyperLedger Fabric Network Organization List`}
      icon={<Cached />}
      apiRefetch={refetch}
    >
      {isLoadingNetwork || isFetchingNetwork ? (
        <LoadingProgress />
      ) : isError ? (
        <Alert
          severity={"error"}
          action={
            <Tooltip title={"Go to dashboard"}>
              <Button color="error" variant="outlined" onClick={() => navigate(networkDashboard)}>
                <b>Dashboard</b>
              </Button>
            </Tooltip>
          }
        >
          <AlertTitle>
            <b>Network not found with ID: {netId}</b>
          </AlertTitle>
          Either this network does not exists or was deleted. Please check the dashboard for more details
        </Alert>
      ) : (
        <OrganizationBoardWithPagination />
      )}
    </SuperAdminHeadWrapper>
  );
};
