import React from "react";
import { ISettings } from "@sculptor/main-process/settings/types";
import { Checkbox, FormHelperText, Divider } from "@mui/joy";
import { StyledFormControl } from "../components/styled";
import { DeepPartial } from "@sculptor/helpers/typeUtils";

interface IGeneralSettingsProps {
  settings: ISettings["general"];
  onChange: (settings: DeepPartial<ISettings["general"]>) => void;
}

export const GeneralSettings = (props: IGeneralSettingsProps) => {
  const { settings, onChange } = props;

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

      <Divider />

      <StyledFormControl>
        <Checkbox
          label="[dev] Display cue ids"
          checked={settings.development.displayCueId}
          onChange={(e) => {
            onChange({
              development: {
                displayCueId: e.target.checked,
              },
            });
          }}
        />
      </StyledFormControl>
    </React.Fragment>
  );
};
