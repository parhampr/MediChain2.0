import { Chip } from "@mui/material";
import { ShowHidePasswordCharacters, getReadableDate } from "../common/utils/others";
import { CollapseExpandButton } from "../common/utils/stylesFunction";
import { AddCircle } from "@mui/icons-material";

export const ascendingOrder = "asc";
export const descendingOrder = "desc";
export const defaultOrderBy = "nameId";

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
}

export function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

export function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

export const headCellsIdentities = [
  {
    id: "nameId",
    align: "left",
    disablePadding: true,
    label: "HOSPITAL ID",
    renderContent: (data) => data,
  },
  {
    id: "adminUserId",
    align: "center",
    disablePadding: false,
    label: "ADMIN ID",
    renderContent: (data) => data,
  },
  {
    id: "adminPassword",
    align: "center",
    disablePadding: false,
    label: "ADMIN PASSWORD",
    renderContent: (data) => <ShowHidePasswordCharacters data={data} />,
  },
  {
    id: "createdAt",
    align: "center",
    disablePadding: false,
    label: "CREATED AT",
    renderContent: (data) => getReadableDate(data),
  },
  {
    id: "enrolled",
    align: "center",
    disablePadding: false,
    label: "ENROLL STATUS",
    renderContent: (data) => (
      <Chip
        label={<b>{data ? "Enrolled" : "Pending"}</b>}
        color={data ? "success" : "error"}
        variant={data ? "filled" : "outlined"}
        sx={{ borderRadius: "4px" }}
      />
    ),
  },
  {
    id: "expand",
    align: "center",
    disablePadding: false,
    label: "MORE DETAILS",
    onClickCell: (item, handleExpandClick) => handleExpandClick(item.rowId),
    renderContent: (item) => (
      <CollapseExpandButton
        tooltipTitle={"Details"}
        expanded={item.isExpanded}
        iconColor="primary"
        sx={{ fontSize: "25px" }}
      />
    ),
  },
];

export const subHeadBodyConfig = [
  {
    id: "fullName",
    label: "Full Hospital Name",
    alignCell1: "left",
    alignCell2: "left",
    disablePaddingCell1: true,
    disablePaddingCell2: false,
  },
  {
    id: "country",
    label: "Country (CA Origin)",
    align: "left",
    alignCell1: "left",
    alignCell2: "left",
    disablePaddingCell1: true,
    disablePaddingCell2: false,
  },
  {
    id: "state",
    label: "State (CA Origin)",
    align: "left",
    alignCell1: "left",
    alignCell2: "left",
    disablePaddingCell1: true,
    disablePaddingCell2: false,
  },
  {
    id: "city",
    label: "Location/City (CA Origin)",
    align: "left",
    alignCell1: "left",
    alignCell2: "left",
    disablePaddingCell1: true,
    disablePaddingCell2: false,
  },
  {
    id: "updatedAt",
    label: "Updated Status on",
    align: "left",
    alignCell1: "left",
    alignCell2: "left",
    disablePaddingCell1: true,
    disablePaddingCell2: false,
    render: (item) => getReadableDate(item["updatedAt"]),
  },
];

export const tableButtons = {
  ADD_ORG: {
    title: "Add Hospital",
    type: "icon",
    buttonAction: "ADD",
    color: "primary",
    render: (
      <AddCircle
        sx={{
          color: "text.primary",
          width: "30px",
          height: "30px",
        }}
      />
    ),
  },
  ENROLL_ORG: {
    title: "Add Hospital",
    type: "button",
    buttonAction: "ENROLL",
    color: "primary",
    render: "Enroll",
  },

  DELETE_ORG: {
    title: "Add Hospital",
    type: "button",
    buttonAction: "DELETE",
    color: "error",
    render: "Delete",
  },
};

export const activeLoadingButtonProps = (statusCode, orgLen, loadStart, loadStop) => {
  let color,
    loading = statusCode === 300 || loadStart || loadStop,
    disabled = statusCode === 300 || orgLen === 0;

  switch (statusCode) {
    case 200:
      color = "success";
      break;
    case 509:
    case 500:
      color = "error";
      break;
    default:
      color = "primary";
      break;
  }

  return { color, loading, disabled };
};
