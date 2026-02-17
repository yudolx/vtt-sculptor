import React from "react";
import { ISettings } from "@sculptor/main-process/settings/types";
import { Checkbox, FormHelperText, Input, Button } from "@mui/joy";
import { StyledFormControl, StyledFormLabel } from "../components/styled";
import { DeepPartial } from "@sculptor/helpers/typeUtils";

interface IGeneralSettingsProps {
  settings: ISettings["general"];
  onChange: (settings: DeepPartial<ISettings["general"]>) => void;
}

export const GeneralSettings = (props: IGeneralSettingsProps) => {
  const { settings, onChange } = props;

  const handleChoosePluginsDirClick = React.useCallback(() => {
    window.electronAPI
      .showOpenDialog({
        properties: ["openDirectory"],
      })
      .then((response) => {
        if (!response.canceled) {
          const [firstFilePath] = response.filePaths;
          onChange({
            pluginsDirectory: firstFilePath,
          });
        }
      });
  }, [onChange]);

  const handleChoosePluginsDirChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange({
        pluginsDirectory: event.target.value,
      });
    },
    [onChange],
  );

  return (
    <React.Fragment>
      <StyledFormControl>
        <Checkbox
          label="Duette loading"
          checked={settings.tryDuete}
          onChange={(e) => {
            onChange({
              tryDuete: e.target.checked,
            });
          }}
        />
        <FormHelperText>
          When opening a video, the program will try to find the matching
          subtitles in the same folder (and vice versa).
        </FormHelperText>
      </StyledFormControl>
      <StyledFormControl>
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
    </React.Fragment>
  );
};
