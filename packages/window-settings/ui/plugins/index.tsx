import React from "react";
import {
  Button,
  Checkbox,
  Divider,
  FormHelperText,
  Input,
  styled,
  Tab,
  TabList,
  TabPanel,
  Tabs,
} from "@mui/joy";
import { PluginsContext } from "@sculptor/helpers/ui/PluginsLoaderAndContext";
import { ISettings } from "@sculptor/main-process/settings/types";
import { StyledFormControl, StyledFormLabel } from "../components/styled";

interface IPluginsSettingsProps {
  settings: ISettings["plugins"] | null;
  onChange: (settings: Partial<Omit<ISettings["plugins"], "list">>) => void;
  onPluginsChange: (pluginId: string, pluginSettings: unknown) => void;
}

const GENERAL_TAB = "__general__";

export const PluginsSettings = (props: IPluginsSettingsProps) => {
  const { settings: propsSettings, onPluginsChange, onChange } = props;
  const { pluginComponentMap } = React.useContext(PluginsContext);
  const [tab, setTab] = React.useState<string>(
    [...pluginComponentMap.entries()]?.[0]?.[0]?.main.pluginId ?? GENERAL_TAB,
  );

  const handleSettingsChange = React.useCallback(
    (pluginId: string, pluginSettings: unknown) => {
      onPluginsChange(pluginId, pluginSettings);
    },
    [onPluginsChange],
  );

  const handleChoosePluginsDirClick = React.useCallback(() => {
    window.electronAPI
      .showOpenDialog({
        properties: ["openDirectory"],
      })
      .then((response) => {
        if (!response.canceled) {
          const [firstFilePath] = response.filePaths;
          onChange({
            directory: firstFilePath,
          });
        }
      });
  }, [onChange]);

  const handleChoosePluginsDirChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange({
        directory: event.target.value,
      });
    },
    [onChange],
  );

  return (
    <Tabs
      orientation="vertical"
      sx={{ height: "100vh", overflow: "auto" }}
      value={tab}
      onChange={(event, value) => setTab(value as string)}
    >
      <TabList sx={{ width: 200 }}>
        <Tab value={GENERAL_TAB}>General</Tab>
        <Divider>Plugins</Divider>
        {[...pluginComponentMap.entries()].map(([plugin]) => {
          return (
            <Tab key={plugin.main.pluginId} value={plugin.main.pluginId}>
              {plugin.main.pluginName}
            </Tab>
          );
        })}
      </TabList>
      <StyledTabPanel value={GENERAL_TAB}>
        <StyledFormControl>
          <Checkbox
            label="Enabled"
            checked={propsSettings?.enabled ?? false}
            onChange={(e) => {
              onChange({
                enabled: e.target.checked,
              });
            }}
          />
          <FormHelperText>
            For this setting to take effect you need to restart the program
          </FormHelperText>
        </StyledFormControl>
        <StyledFormControl>
          <StyledFormLabel>Plugins folder</StyledFormLabel>
          <Input
            placeholder="or type the path manually here"
            value={propsSettings?.directory}
            onChange={handleChoosePluginsDirChange}
            startDecorator={
              <Button onClick={handleChoosePluginsDirClick}>Choose</Button>
            }
          />
          <FormHelperText>
            For this setting to take effect you need to restart the program
          </FormHelperText>
        </StyledFormControl>
      </StyledTabPanel>
      {[...pluginComponentMap.entries()].map(([plugin, componentMap]) => {
        return (
          <StyledTabPanel
            key={plugin.main.pluginId}
            value={plugin.main.pluginId}
          >
            <componentMap.Settings
              settings={propsSettings?.list?.[plugin.main.pluginId] ?? null}
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

/**
 * 
 *       <StyledFormControl>
         <StyledFormLabel>Plugins folder</StyledFormLabel>
         <Input
           placeholder="or type the path manually here"
           value={settings.pluginsDirectory}
           onChange={handleChoosePluginsDirChange}
           startDecorator={
             <Button onClick={handleChoosePluginsDirClick}>Choose</Button>
           }
         />
         <FormHelperText>
           For this setting to take effect you need to restart the program
         </FormHelperText>
       </StyledFormControl>
 */
