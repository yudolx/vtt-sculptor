import React from "react";
import { styled, Tab, TabList, TabPanel, Tabs } from "@mui/joy";
import { PluginsContext } from "@sculptor/helpers/ui/PluginsLoaderAndContext";
import { ISettings } from "@sculptor/main-process/settings/types";

interface IPluginsSettingsProps {
  settings: ISettings["plugins"] | null;
  onChange: (pluginId: string, pluginSettings: unknown) => void;
}

export const PluginsSettings = (props: IPluginsSettingsProps) => {
  const { settings: propsSettings, onChange: propsOnChange } = props;
  const { pluginComponentMap } = React.useContext(PluginsContext);
  const [tab, setTab] = React.useState<string>(
    [...pluginComponentMap.entries()][0][0].main.pluginId,
  );

  const handleSettingsChange = React.useCallback(
    (pluginId: string, pluginSettings: unknown) => {
      propsOnChange(pluginId, pluginSettings);
    },
    [propsOnChange],
  );

  return (
    <Tabs
      orientation="vertical"
      sx={{ height: "100vh", overflow: "auto" }}
      value={tab}
      onChange={(event, value) => setTab(value as string)}
    >
      <TabList sx={{ width: 200 }}>
        {[...pluginComponentMap.entries()].map(([plugin]) => {
          return (
            <Tab key={plugin.main.pluginId} value={plugin.main.pluginId}>
              {plugin.main.pluginName}
            </Tab>
          );
        })}
      </TabList>
      {[...pluginComponentMap.entries()].map(([plugin, componentMap]) => {
        return (
          <StyledTabPanel
            key={plugin.main.pluginId}
            value={plugin.main.pluginId}
          >
            <componentMap.Settings
              settings={propsSettings?.[plugin.main.pluginId] ?? null}
              onChange={(newSettings) =>
                handleSettingsChange(plugin.main.pluginId, newSettings)
              }
            />
          </StyledTabPanel>
        );
      })}
    </Tabs>
  );
};

const StyledTabPanel = styled(TabPanel, { name: "StyledTabPanel" })(() => {
  return {
    padding: 0,
  };
});
