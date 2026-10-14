import React from "react";
import { styled } from "@mui/joy";
import { TextAreaEditableCell } from "./text-area-editable-cell";
import { IVTTCue, stringifyTimestamp } from "@sculptor/helpers/vtt";
import { toFixedNumber } from "@sculptor/helpers/to-fixed-number";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useQuery } from "@tanstack/react-query";
import { QueryKey } from "@sculptor/helpers/constants";

export interface ISubtitleTableRowProps {
  isActive: boolean;
  isNew?: boolean;
  cue: IVTTCue;
  editField: keyof IVTTCue | null;
  onClick: (cue: IVTTCue, event: React.MouseEvent<HTMLTableRowElement>) => void;
  onCellChange: (
    field: keyof IVTTCue,
    value: IVTTCue[keyof IVTTCue],
    blur: boolean,
  ) => void;
  onDoubleCellClick: (field: keyof IVTTCue) => void;
  onContextMenu: (cue: IVTTCue) => void;
}
export interface ISubtitleTableRowState {}

export const SubtitleTableRow = (props: ISubtitleTableRowProps) => {
  const {
    cue,
    onCellChange,
    onClick,
    onContextMenu,
    onDoubleCellClick,
    isActive,
    editField,
    isNew,
  } = props;

  const { data: settings = null } = useQuery({
    queryKey: [QueryKey.Settings],
    queryFn: window.electronAPI.fetchSettings,
  });

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: cue.uuid });

  const [rowEl, setRowEl] = React.useState<HTMLTableRowElement | null>(null);

  React.useEffect(() => {
    if (isNew) {
      rowEl?.scrollIntoView({ block: "nearest" });
    }
  }, [isNew, rowEl]);

  const handleRowMouseDown = React.useCallback(
    (event: React.MouseEvent<HTMLTableRowElement>) => {
      if (event.button === 0) {
        onClick(cue, event);
      }
    },
    [onClick, cue],
  );

  const handleChange = React.useCallback(
    (value: IVTTCue[keyof IVTTCue], field: keyof IVTTCue, blur: boolean) => {
      onCellChange(field, value, blur);
    },
    [onCellChange],
  );

  const handleCellDoubleClick = React.useCallback(
    (field: keyof IVTTCue) => {
      if (editField !== field) {
        onDoubleCellClick(field);
      }
    },
    [onDoubleCellClick, editField],
  );

  const handleContextMenu: React.MouseEventHandler<HTMLTableRowElement> =
    React.useCallback(
      (e) => {
        if (editField === null) {
          if (!(e.target instanceof HTMLTextAreaElement)) {
            e.preventDefault();
            e.stopPropagation();
          }
          onContextMenu(cue);
        }
      },
      [onContextMenu, cue, editField],
    );

  return (
    <StyledRow
      active={props.isActive}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      ref={(el) => {
        setRowEl(el);
        setNodeRef(el);
      }}
      onMouseDown={handleRowMouseDown}
      onContextMenu={handleContextMenu}
      {...(editField === null && {
        ...attributes,
        ...listeners,
      })}
    >
      <td title={cue.startTime.toString()}>
        {stringifyTimestamp(cue.startTime)}
      </td>
      <td title={cue.endTime.toString()}>{stringifyTimestamp(cue.endTime)}</td>
      <td>{toFixedNumber(cue.endTime - cue.startTime, 3)}</td>
      <TextAreaEditableCell
        edit={isActive && editField === "text"}
        cue={cue}
        field="text"
        displayId={settings?.general.development.displayCueId ?? false}
        onChange={handleChange}
        onDoubleClick={handleCellDoubleClick}
      />
    </StyledRow>
  );
};

const StyledRow = styled("tr", {
  name: "Row",
  shouldForwardProp: (prop) => prop !== "active",
})<{ active: boolean }>(({ active, theme }) => {
  return {
    outline: "none",
    ...(active && {
      td: {
        backgroundColor: theme.palette.primary.plainActiveBg,
      },
    }),
  };
});
