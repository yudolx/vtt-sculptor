import React from "react";
import { Tab, TabList, TabPanel, Tabs } from "@mui/joy";
import { StylesSettings } from "./styles-settings";
import { useQuery } from "@tanstack/react-query";
import { QueryKey } from "@sculptor/helpers/constants";

enum SettingsTab {
  General,
  Style,
}

export const App = () => {
  const [tab, setTab] = React.useState(SettingsTab.General);

  const settingsQuery = useQuery({
    queryKey: [QueryKey.Settings],
    queryFn: window.electronAPI.fetchSettings,
  });

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
      </TabList>
      <TabPanel value={SettingsTab.General}>
        <b>First</b> tab panel
      </TabPanel>
      <TabPanel value={SettingsTab.Style}>
        <StylesSettings
          externalCueIds={settingsQuery.data?.externalCueIds ?? []}
        />
      </TabPanel>
    </Tabs>
  );
};
