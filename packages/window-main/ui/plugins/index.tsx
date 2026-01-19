import React from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionGroup,
  AccordionSummary,
  styled,
} from "@mui/joy";
import { SourceEdit } from "./source-edit";
import { TranscriptPreview } from "./transcript-preview";
import { useQuery } from "@tanstack/react-query";
import { QueryKey } from "@sculptor/helpers/constants";
import { IPlugin } from "@sculptor/main-process/plugins-manager";

export const Plugins = () => {
  const { data: pluginsList } = useQuery({
    queryKey: [QueryKey.PluginsList],
    queryFn: window.electronAPI.fetchPluginsList,
  });

  const pluginComponentMap = React.useMemo(() => {
    const pluginMap = new Map<IPlugin, React.LazyExoticComponent<any>>();

    pluginsList?.forEach((plugin) => {
      const component = React.lazy(() => lazyPluginLoad(plugin.main.pluginId));
      pluginMap.set(plugin, component);
    });

    return pluginMap;
  }, [pluginsList]);

  return (
    <AccordionGroup size="lg" sx={{ overflow: "auto", maxHeight: "100%" }}>
      <Accordion>
        <StyledAccordionSummary>Source edit</StyledAccordionSummary>
        <StyledAccordionDetails>
          <SourceEdit />
        </StyledAccordionDetails>
      </Accordion>
      <Accordion>
        <StyledAccordionSummary>
          Thulean transcription preview
        </StyledAccordionSummary>
        <StyledAccordionDetails>
          <TranscriptPreview />
        </StyledAccordionDetails>
      </Accordion>
      {pluginComponentMap
        .entries()
        .toArray()
        .map(([plugin, Component]) => (
          <Accordion key={plugin.main.pluginId}>
            <StyledAccordionSummary>
              {plugin.main.pluginName}
            </StyledAccordionSummary>
            <StyledAccordionDetails>
              <React.Suspense>
                <Component />
              </React.Suspense>
            </StyledAccordionDetails>
          </Accordion>
        ))}
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

const lazyPluginLoad = async (pluginId: string): Promise<{ default: any }> => {
  // @ts-expect-error
  await __webpack_init_sharing__("default");

  // @ts-expect-error
  const container = window[pluginId];
  if (!container.__initialized) {
    // @ts-expect-error
    await container.init(__webpack_share_scopes__.default);
    container.__initialized = true;
  }

  const factory = await container.get("./App");
  return factory();
};
