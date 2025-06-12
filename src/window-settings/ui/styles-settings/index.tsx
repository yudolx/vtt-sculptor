import React from "react";
import {
  Box,
  Button,
  IconButton,
  Input,
  InputProps,
  List,
  ListDivider,
  ListItem,
  ListItemContent,
  ListItemDecorator,
} from "@mui/joy";
import { TrashIcon } from "@heroicons/react/24/outline";
import { ISettings } from "main-process/settings/types";

export interface IStylesSettingsProps {
  externalCueIds: ISettings["externalCueIds"];
}

export const StylesSettings = (props: IStylesSettingsProps) => {
  const { externalCueIds } = props;
  const [inputValue, setInputValue] = React.useState("");

  const handleAddButtonClick = React.useCallback(() => {
    if (inputValue.length > 0 && !externalCueIds.includes(inputValue)) {
      window.electronAPI.settingsSetExternalCueIds([
        ...externalCueIds,
        inputValue,
      ]);
    }

    setInputValue("");
  }, [externalCueIds, inputValue]);

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
                window.electronAPI.settingsSetExternalCueIds(
                  externalCueIds.filter((id) => id !== cueId),
                );
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
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        overflow: "auto",
        maxHeight: "500px",
      }}
    >
      <Box sx={{ overflow: "auto" }}>
        <List>
          {externalCueIds.length > 0 ? (
            externalCueIds.map(renderListItem)
          ) : (
            <ListItem sx={{ justifyContent: "center" }}>
              No saved external IDs
            </ListItem>
          )}
        </List>
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
    </Box>
  );
};
