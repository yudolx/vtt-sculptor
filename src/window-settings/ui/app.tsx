import React from "react";
import { Box } from "@mui/joy";
import { StylesSettings } from "./styles-settings";

export const App = () => {
  return (
    <Box sx={{ padding: "10px" }}>
      <fieldset>
        <legend>General</legend>
      </fieldset>
      <StylesSettings />
    </Box>
  );
};
