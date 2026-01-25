import React from "react";
import {
  CircularProgress,
  styled,
  Tab,
  TabList,
  TabPanel,
  Tabs,
} from "@mui/joy";
import { StylesSettings } from "./styles";
import { useQuery } from "@tanstack/react-query";
import { QueryKey } from "@sculptor/helpers/constants";
import { PluginsContext } from "@sculptor/helpers/ui/PluginsLoaderAndContext";
import { PluginsSettings } from "./plugins";
import { GeneralSettings } from "./general";

enum SettingsTab {
  General,
  Style,
  Plugins,
}

export const App = () => {
  const { pluginComponentMap } = React.useContext(PluginsContext);
  const [tab, setTab] = React.useState(SettingsTab.General);

  const { data: settings = null, isLoading } = useQuery({
    queryKey: [QueryKey.Settings],
    queryFn: window.electronAPI.fetchSettings,
  });

  const handlePluginsSettingsChange = React.useCallback(
    (pluginId: string, pluginSettings: unknown) => {
      window.electronAPI.setSettings({
        plugins: {
          [pluginId]: pluginSettings,
        },
      });
    },
    [],
  );

  if (isLoading || settings === null) {
    return <CircularProgress variant="solid" />;
  }

  return (
    <Tabs
      orientation="vertical"
      sx={{ height: "100vh", overflow: "auto" }}
      value={tab}
      onChange={(event, value) => setTab(value as SettingsTab)}
    >
      <TabList sx={{ width: 200 }}>
        <Tab value={SettingsTab.General}>General</Tab>
        <Tab value={SettingsTab.Style}>Styles</Tab>
        {pluginComponentMap.size > 0 && (
          <Tab value={SettingsTab.Plugins}>Plugins</Tab>
        )}
      </TabList>
      <StyledTabPanel value={SettingsTab.General}>
        <GeneralSettings
          settings={settings.general}
          onChange={(settings) => {
            window.electronAPI.setSettings({
              general: settings,
            });
          }}
        />
      </StyledTabPanel>
      <StyledTabPanel value={SettingsTab.Style}>
        <StylesSettings
          settings={settings.styles}
          onChange={(settings) => {
            window.electronAPI.setSettings({
              styles: settings,
            });
          }}
        />
      </StyledTabPanel>
      {pluginComponentMap.size > 0 && (
        <StyledTabPanel value={SettingsTab.Plugins}>
          <PluginsSettings
            settings={settings.plugins ?? null}
            onChange={handlePluginsSettingsChange}
          />
        </StyledTabPanel>
      )}
    </Tabs>
  );
};

const StyledTabPanel = styled(TabPanel, { name: "StyledTabPanel" })(() => {
  return {
    padding: 0,
  };
});
