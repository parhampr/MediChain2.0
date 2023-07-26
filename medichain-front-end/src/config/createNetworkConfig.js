import { CheckCircle, DriveFileRenameOutline, ExpandCircleDown, Grid3x3, Pending, Public } from "@mui/icons-material";
import { Box, InputAdornment, Table, TableBody, TableCell, TableRow, Tooltip, Typography } from "@mui/material";
import { getReadableDate } from "../common/utils/others";

export const createNetworkConfig = [
  {
    id: "networkDetails",
    title: "Create New Network",
    description: "The network configuration details below are required to add new hospitals into the network",
    borderRadius: (open) => (open ? "12px 12px 0 0" : "12px"),
    icon: <ExpandCircleDown sx={{ color: "text.primary" }} />,
    defaultOpen: true,
    renderFields: ["netName", "netId", "address"],
    requiredFields: ["netName", "netId", "address"],
    fields: [
      {
        uid: "netName",
        type: "TextField",
        gridProps: {
          item: true,
          xs: 12,
          md: 6,
        },
        fieldProps: {
          autoFocus: true,
          name: "netName",
          id: "netName",
          type: "text",
          label: "Network Name *",
          placeholder: "First_Network",
          helperText: `A valid network name must be at least five characters long, without any spaces and without any other special characters than the "underscore" and "dot" at the beginning or ending.`,
          autoComplete: "name",
          InputProps: {
            startAdornment: (
              <InputAdornment position="start">
                <DriveFileRenameOutline sx={{ color: "text.primary" }} />
              </InputAdornment>
            ),
          },
        },
      },
      {
        uid: "netId",
        type: "TextField",
        gridProps: {
          item: true,
          xs: 12,
          md: 6,
        },
        fieldProps: {
          name: "netId",
          id: "netId",
          type: "text",
          label: "Network ID *",
          placeholder: "First",
          helperText: `A network ID must be at least 5 characters long, without any whitespace or special characters at the start or finish. The special symbols "underscore" and "dot" are accepted.`,
          autoComplete: "id",
          InputProps: {
            startAdornment: (
              <InputAdornment position="start">
                <Grid3x3 sx={{ color: "text.primary" }} />
              </InputAdornment>
            ),
          },
        },
      },
      {
        uid: "address",
        type: "TextField",
        gridProps: {
          item: true,
          xs: 12,
        },
        fieldProps: {
          name: "address",
          id: "address",
          type: "text",
          label: "Network Address *",
          placeholder: "Type your network address here...",
          helperText: `For network address please remove http|https:// and www., if any`,
          autoComplete: "id",
          InputProps: {
            startAdornment: (
              <InputAdornment position="start">
                <Public sx={{ color: "text.primary" }} />
              </InputAdornment>
            ),
          },
        },
      },
    ],
  },
];

export const createNetworkErrorConfig = {
  networkDetails: {
    accordionError: false,
    fields: {
      netName: false,
      netId: false,
      address: false,
    },
  },
};

export const tablesAccordionConfig = (network, organizations) => [
  {
    title: "Network Details",
    subTitle: "Open the panel to hide/view details",
    id: "network-details",
    radius: () => "12px 12px 0 0",
    content: (
      <Table>
        <TableBody>
          {[
            ["Network ID", network._id],
            ["Network Address", network.address],
            ["Network Created on", getReadableDate(network.createdAt)],
            ["Total Hospital Organizations", organizations.length],
          ].map(([key, value], i) => (
            <TableRow key={i}>
              <TableCell>{key}</TableCell>
              <TableCell>
                : <b>{value}</b>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    ),
  },
  {
    title: "Organization Hospital Details",
    subTitle: `View all the hospital organizations associated with ${network.name} network`,
    id: "org-details",
    radius: (opened) => (opened ? "12px 12px 0 0" : "0px 0px 12px 12px"),
    content:
      organizations.length === 0 ? (
        <Typography textAlign={"center"}>No hospitals have been registered yet</Typography>
      ) : (
        <Table>
          <TableBody>
            {organizations.map((org, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <span> {org.fullName}</span>
                    <span style={{ marginLeft: "10px" }}>
                      <Tooltip title={org.enrolled ? "Enrolled" : "Pending Enrollment"}>
                        {org.enrolled ? <CheckCircle color="success" /> : <Pending color="primary" />}
                      </Tooltip>
                    </span>
                  </Box>
                </TableCell>
                <TableCell>
                  : <b>{org.nameId}</b>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ),
  },
];
