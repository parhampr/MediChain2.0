import { Visibility, VisibilityOff } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { useState } from "react";

// Render Method for headCellsIdentities:adminPassword
export const ShowHidePasswordCharacters = ({ data }) => {
  const [pass, setPass] = useState(data.replace(/(?<!^).(?!$)/g, "*"));
  const [show, setShow] = useState(false);

  const showHidePass = (e) => {
    e.stopPropagation();
    setPass(show ? data.replace(/(?<!^).(?!$)/g, "*") : data);
    setShow(!show);
  };

  return (
    <>
      {pass}
      <IconButton sx={{ ml: 1 }} onClick={showHidePass}>
        {show ? <Visibility /> : <VisibilityOff />}
      </IconButton>
    </>
  );
};

// Render Method for headCellsIdentities:createdAt & subHeadBodyConfig:updatedAt
export const getReadableDate = (date) => {
  const parsedDate = new Date(date);
  return `${parsedDate.toLocaleString("default", {
    month: "long",
  })} ${parsedDate.getDate()}, ${parsedDate.getFullYear()}`;
};
