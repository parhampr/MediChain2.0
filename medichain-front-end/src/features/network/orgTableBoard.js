import { AddCircle, Cached } from "@mui/icons-material";
import {
  Alert,
  AlertTitle,
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
import { Box } from "@mui/system";
import { visuallyHidden } from "@mui/utils";
import { Fragment, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useStylesOrganizationTableClass } from "../../classes/network/organizationTable";
import { networkDashboard } from "../../common/constants/routesConstants";
import { NetworkStatusLoading } from "../../common/utils/networkStatus";
import {
  SuperAdminHeadWrapper,
  LoadingProgress,
  CollapseExpandButton,
  EmptyDataVisualComp,
} from "../../common/utils/stylesFunction";
import {
  ascendingOrder,
  defaultOrderBy,
  descendingOrder,
  getComparator,
  headCellsIdentities,
  stableSort,
  subHeadBodyConfig,
} from "../../config/organizationsTableStructure";
import { useFetchSingleNetworkQuery } from "./networkApiSlice";
import { selectAllOrganizations, selectNetworkById } from "./networkSlice";
import emptyTable from "../../static/images/emptyTable.webp";
import { CreateOrganizationDialogForm } from "./dialogContent/tableOrgForms";

const NewOrganizationDialogBox = () => {
  const [open, setOpen] = useState(false);

  return (
    <Fragment>
      {open && <CreateOrganizationDialogForm closeDialogBox={() => setOpen(false)} />}
      <Tooltip title="Add Hospital">
        <IconButton
          variant="contained"
          sx={{
            fontWeight: "bolder",
            minWidth: "fit-content",
            ml: 1,
          }}
          onClick={() => setOpen(true)}
        >
          <AddCircle
            sx={{
              color: "text.primary",
              width: "30px",
              height: "30px",
            }}
          />
        </IconButton>
      </Tooltip>
    </Fragment>
  );
};

const EnrollOrganizationsDialogBox = () => {
  const [open, setOpen] = useState(false);
  return (
    <Fragment>
      {open && <CreateOrganizationDialogForm closeDialogBox={() => setOpen(false)} />}
      <Tooltip title="Enroll Hospital(s)">
        <Button
          variant="contained"
          sx={{
            fontWeight: "bolder",
            minWidth: "fit-content",
            ml: 1,
            textTransform: "capitalize",
          }}
          onClick={() => setOpen(true)}
        >
          Enroll
        </Button>
      </Tooltip>
    </Fragment>
  );
};

const DeleteOrganizationsDialogBox = () => {
  const [open, setOpen] = useState(false);
  return (
    <Fragment>
      {open && <CreateOrganizationDialogForm closeDialogBox={() => setOpen(false)} />}
      <Tooltip title="Delete Hospital(s)">
        <Button
          variant="contained"
          color="error"
          sx={{
            fontWeight: "bolder",
            minWidth: "fit-content",
            ml: 1,
            textTransform: "capitalize",
          }}
          onClick={() => setOpen(true)}
        >
          Delete
        </Button>
      </Tooltip>
    </Fragment>
  );
};

const OrganizationTableToolBar = ({ selected, setSelected }) => {
  const { netId } = useParams();
  const numSelected = selected.length;
  return (
    <Toolbar
      sx={{
        padding: 2,
        minHeight: "78px !important",
        borderRadius: "12px 12px 0 0",
        ...(numSelected > 0 && {
          backgroundColor: "primary.secondarySectionContainer",
        }),
      }}
    >
      {numSelected > 0 ? (
        <>
          <Typography sx={{ flex: "1 1 100%", fontWeight: "bold" }} color="inherit" variant="subtitle1" component="div">
            {numSelected} selected
          </Typography>
          <EnrollOrganizationsDialogBox />
          <DeleteOrganizationsDialogBox />
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
          <NewOrganizationDialogBox />
        </>
      )}
    </Toolbar>
  );
};

const OrganizationTableHead = ({ onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort }) => (
  <TableHead sx={{ backgroundColor: "primary.sectionContainer" }}>
    <TableRow>
      <TableCell padding="checkbox">
        <Checkbox
          color="primary"
          indeterminate={numSelected > 0 && numSelected < rowCount}
          checked={rowCount > 0 && numSelected === rowCount}
          onChange={onSelectAllClick}
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
      <TableCell align="center">
        <Typography sx={{ color: "text.secondary", fontWeight: "bolder" }}>MORE DETAILS</Typography>
      </TableCell>
    </TableRow>
  </TableHead>
);

const OrganizationTable = () => {
  const { netId } = useParams();
  const classes = useStylesOrganizationTableClass();
  const network = useSelector((state) => selectNetworkById(state, netId ?? "0"));
  const orgRows = useSelector(selectAllOrganizations).filter(
    ({ _id }) => network?.associatedOrgID?.includes(_id) ?? false
  );
  const [order, setOrder] = useState(ascendingOrder);
  const [orderBy, setOrderBy] = useState(defaultOrderBy);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [collapseContent, setCollapseContent] = useState(() => {
    const collapse = {};
    orgRows.forEach(({ _id }) => {
      collapse[_id] = false;
    });
    return collapse;
  });

  const handleRequestSort = (columnId) => {
    // Toggle Asc to Desc
    setOrder(orderBy === columnId && order === ascendingOrder ? descendingOrder : ascendingOrder);
    setOrderBy(columnId);
  };

  // Either Select All or Deselect All
  const handleSelectAllClick = (event) =>
    setSelected(() => (event.target.checked ? orgRows.map((row) => row._id) : []));

  // Select or unselect single orgRow
  const handleSelectSingleClick = (rowId) => {
    const selectedIndex = selected.indexOf(rowId);
    let newSelected = [];

    if (selectedIndex === -1) newSelected = newSelected.concat(selected, rowId);
    else if (selectedIndex === 0) newSelected = newSelected.concat(selected.slice(1));
    else if (selectedIndex === selected.length - 1) newSelected = newSelected.concat(selected.slice(0, -1));
    else if (selectedIndex > 0)
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));

    setSelected(() => newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const onChangeCollapseContent = (id) => setCollapseContent((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isSelected = (name) => selected.indexOf(name) !== -1;

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - orgRows.length) : 0;

  const renderTable = useMemo(
    () =>
      stableSort(orgRows, getComparator(order, orderBy)).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [orgRows, order, orderBy, page, rowsPerPage]
  );

  return (
    <>
      <OrganizationTableToolBar selected={selected} />
      <TableContainer className={classes.outermostTableContainer}>
        <Table sx={{ minWidth: 650 }} aria-labelledby="hospital organizations">
          <OrganizationTableHead
            numSelected={selected.length}
            order={order}
            orderBy={orderBy}
            onSelectAllClick={handleSelectAllClick}
            rowCount={orgRows?.length ?? 0}
            onRequestSort={handleRequestSort}
          />
          <TableBody>
            {renderTable.map((row, i) => {
              const isItemSelected = isSelected(row._id);
              const labelId = `enhanced-table-checkbox-${i}`;

              return (
                <Fragment key={row._id}>
                  <TableRow
                    hover
                    onClick={() => handleSelectSingleClick(row._id)}
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    selected={isItemSelected}
                    sx={{ "&.MuiTableRow-root.Mui-selected": { backgroundColor: "primary.secondarySectionContainer" } }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox color="primary" checked={isItemSelected} inputProps={{ "aria-labelledby": labelId }} />
                    </TableCell>
                    {headCellsIdentities.map(({ align, disablePadding, id, renderContent }) => (
                      <TableCell
                        align={align}
                        padding={disablePadding ? "none" : "normal"}
                        key={`${row._id}-${id}`}
                        style={{ paddingRight: align === "center" ? "36px" : "16px" }}
                      >
                        {renderContent(row[id])}
                      </TableCell>
                    ))}
                    <TableCell
                      align="center"
                      padding="normal"
                      onClick={(e) => {
                        e.stopPropagation();
                        onChangeCollapseContent(row._id);
                      }}
                    >
                      <CollapseExpandButton
                        tooltipTitle={"Details"}
                        expanded={collapseContent[row._id]}
                        iconColor="primary"
                        sx={{ fontSize: "25px" }}
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={7} padding={"none"} sx={{ borderBottom: 0 }}>
                      <Collapse in={collapseContent[row._id]} timeout="auto" unmountOnExit>
                        <TableContainer className={classes.middleMostTableContainer}>
                          <Table>
                            <TableBody>
                              <TableRow>
                                <TableCell padding={"none"} align={"center"} sx={{ borderBottom: 0, width: "40%" }}>
                                  <Typography>More Details for {row["nameId"]}</Typography>
                                </TableCell>
                                <TableCell padding={"none"} sx={{ borderBottom: 0 }}>
                                  <TableContainer>
                                    <Table aria-labelledby={`hospital organization details-${i}`}>
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
                </Fragment>
              );
            })}
            {emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={6} />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {orgRows.length < 1 && (
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
        count={orgRows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </>
  );
};

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
        <OrganizationTable />
      )}
    </SuperAdminHeadWrapper>
  );
};
