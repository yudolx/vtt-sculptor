import React from "react";
import { Button, ButtonGroup, styled } from "@mui/joy";
import { PluginsContext } from "@sculptor/helpers/ui/PluginsLoaderAndContext";
import { wrapSelectedTextInTag } from "@sculptor/helpers/wrapSelectedTextInTag";

export interface IEditorToolboxProps {
  textAreaEl: HTMLTextAreaElement | null;
}

export const EditorToolbox = (props: IEditorToolboxProps) => {
  const { textAreaEl } = props;
  const { pluginComponentMap } = React.useContext(PluginsContext);

  return (
    <ButtonGroup
      size="sm"
      variant="plain"
      sx={{
        position: "absolute",
        left: "2px",
        bottom: "2px",
        borderBottom: "1px #eee solid",
      }}
    >
      <ToolboxButton
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (textAreaEl) {
            wrapSelectedTextInTag(textAreaEl, ["<b>", "</b>"]);
          }
        }}
      >
        <strong>B</strong>
      </ToolboxButton>
      <ToolboxButton
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (textAreaEl) {
            wrapSelectedTextInTag(textAreaEl, ["<i>", "</i>"]);
          }
        }}
      >
        <i>I</i>
      </ToolboxButton>
      <ToolboxButton
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (textAreaEl) {
            wrapSelectedTextInTag(textAreaEl, ["<u>", "</u>"]);
          }
        }}
      >
        <u>U</u>
      </ToolboxButton>
      <React.Suspense>
        {pluginComponentMap
          .entries()
          .toArray()
          .map(([plugin, PluginMap]) => {
            return (
              <PluginMap.EditorToolbox
                key={plugin.main.pluginId}
                textAreaEl={textAreaEl}
              />
            );
          })}
      </React.Suspense>
    </ButtonGroup>
  );
};

const ToolboxButton = styled(Button, { name: "ToolboxButton" })(() => {
  return {
    fontWeight: "normal",
  };
});
