import React from "react";
import { styled } from "@mui/joy";
import { IVTTCue } from "shared/libs/vtt/vttcue";
import { TextAreaEditableCell } from "./text-area-editable-cell";
import { toFixedNumber } from "shared/to-fixed-number";
import { stringifyTimestamp } from "shared/libs/vtt/WebVTTDeserializer";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export interface ISubtitleTableRowProps {
  active: boolean;
  isNew?: boolean;
  cue: IVTTCue;
  editField: keyof IVTTCue | null;
  onClick: (cue: IVTTCue, event: React.MouseEvent<HTMLTableRowElement>) => void;
  onCellFocus: () => void;
  onCellBlur: () => void;
  onCellChange: (field: keyof IVTTCue, value: IVTTCue[keyof IVTTCue]) => void;
  onDoubleCellClick: (field: keyof IVTTCue) => void;
  onContextMenu: (cue: IVTTCue) => void;
}
export interface ISubtitleTableRowState {}

export const SubtitleTableRow = (props: ISubtitleTableRowProps) => {
  const {
    cue,
    onCellBlur,
    onCellChange,
    onCellFocus,
    onClick,
    onContextMenu,
    onDoubleCellClick,
    active,
    editField,
    isNew,
  } = props;

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
    (value: IVTTCue[keyof IVTTCue], field: keyof IVTTCue) => {
      onCellChange(field, value);
    },
    [onCellChange],
  );

  const handleCellDoubleClick = React.useCallback(
    (field: keyof IVTTCue) => {
      if (active && editField !== field) {
        onDoubleCellClick(field);
      }
    },
    [onDoubleCellClick, active, editField],
  );

  const handleCellBlur = React.useCallback(() => {
    onCellBlur();
  }, [onCellBlur]);

  const handleCellFocus = React.useCallback(() => {
    onCellFocus();
  }, [onCellFocus]);

  const handleContextMenu: React.MouseEventHandler<HTMLTableRowElement> =
    React.useCallback(
      (e) => {
        e.preventDefault();
        e.stopPropagation();
        onContextMenu(cue);
      },
      [onContextMenu, cue],
    );

  return (
    <StyledRow
      active={props.active}
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
      {...((!active || editField === null) && {
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
        edit={active && editField === "text"}
        cue={cue}
        field="text"
        onBlur={handleCellBlur}
        onFocus={handleCellFocus}
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
