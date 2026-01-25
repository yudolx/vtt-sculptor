import React from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionGroup,
  AccordionSummary,
  styled,
} from "@mui/joy";
import { PluginsContext } from "@sculptor/helpers/ui/PluginsLoaderAndContext";

export const Plugins = () => {
  const { pluginComponentMap } = React.useContext(PluginsContext);

  return (
    <AccordionGroup size="lg" sx={{ overflow: "auto", maxHeight: "100%" }}>
      {pluginComponentMap
        .entries()
        .toArray()
        .map(([plugin, PluginMap]) => {
          return (
            <Accordion key={plugin.main.pluginId}>
              <StyledAccordionSummary>
                {plugin.main.pluginName}
              </StyledAccordionSummary>
              <StyledAccordionDetails>
                <React.Suspense>
                  <PluginMap.App />
                </React.Suspense>
              </StyledAccordionDetails>
            </Accordion>
          );
        })}
    </AccordionGroup>
  );
};

const StyledAccordionSummary = styled(AccordionSummary)(() => {
  return {
    backgroundColor: "#F0F4F8",
  };
});

const StyledAccordionDetails = styled(AccordionDetails)(() => {
  return {
    "& > .MuiAccordionDetails-content": {
      padding: 0,
    },
  };
});
