import React from "react";
import {
  Box,
  Button,
  FormHelperText,
  IconButton,
  Input,
  InputProps,
  List,
  ListDivider,
  ListItem,
  ListItemContent,
  ListItemDecorator,
  styled,
} from "@mui/joy";
import { TrashIcon } from "@heroicons/react/24/outline";
import { ISettings } from "@sculptor/main-process/settings/types";
import { StyledFormControl, StyledFormLabel } from "../components/styled";
import { DeepPartial } from "@sculptor/helpers/typeUtils";

export interface IStylesSettingsProps {
  settings: ISettings["styles"];
  onChange: (settings: DeepPartial<ISettings["styles"]>) => void;
}

export const StylesSettings = (props: IStylesSettingsProps) => {
  const { onChange } = props;
  const { externalCueIds } = props.settings;
  const [inputValue, setInputValue] = React.useState("");

  const handleAddButtonClick = React.useCallback(() => {
    if (inputValue.length > 0 && !externalCueIds.includes(inputValue)) {
      onChange({
        externalCueIds: [...externalCueIds, inputValue],
      });
    }

    setInputValue("");
  }, [externalCueIds, onChange, inputValue]);

  const handleInputChange = React.useCallback<Required<InputProps>["onChange"]>(
    (event) => {
      setInputValue(event.currentTarget.value);
    },
    [],
  );

  const handleInputKeyDown = React.useCallback<
    Required<InputProps>["onKeyDown"]
  >(
    (event) => {
      if (event.key === "Enter") {
        handleAddButtonClick();
      }
    },
    [handleAddButtonClick],
  );

  const renderListItem = (cueId: string) => {
    return (
      <React.Fragment>
        <ListItem key={cueId}>
          <ListItemDecorator>
            <IconButton
              size="sm"
              variant="outlined"
              color="danger"
              onClick={() => {
                onChange({
                  externalCueIds: externalCueIds.filter((id) => id !== cueId),
                });
              }}
            >
              <TrashIcon width={20} />
            </IconButton>
          </ListItemDecorator>
          <ListItemContent>{cueId}</ListItemContent>
        </ListItem>
        <ListDivider />
      </React.Fragment>
    );
  };

  return (
    <Wrapper>
      <StyledFormControl>
        <StyledFormLabel>List of external cue IDs</StyledFormLabel>
        <FormHelperText>
          If you've defined custom cue ids in your own css file, you can list
          them here and you'll get matching suggestions in the program whenever
          appropriate.
        </FormHelperText>
        <Box sx={{ overflow: "auto" }}>
          <List>{externalCueIds.map(renderListItem)}</List>
        </Box>
        <Box>
          <Input
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            endDecorator={<Button onClick={handleAddButtonClick}>Add</Button>}
            sx={{ marginTop: 1 }}
          ></Input>
        </Box>
      </StyledFormControl>
    </Wrapper>
  );
};

export const Wrapper = styled(Box, { name: "Wrapper" })(() => {
  return {
    display: "flex",
    flexDirection: "column",
    overflow: "auto",
    maxHeight: "500px",
  };
});
