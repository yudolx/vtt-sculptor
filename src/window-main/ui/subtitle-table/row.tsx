import React from "react";
import { styled } from "@mui/joy";
import { IVTTCue } from "shared/libs/vtt/vttcue";
import { TextAreaEditableCell } from "./text-area-editable-cell";
import { toFixedNumber } from "shared/to-fixed-number";

export interface ISubtitleTableRowProps {
  active: boolean;
  cue: IVTTCue;
  editField: keyof IVTTCue | null;
  onClick: (cue: IVTTCue) => void;
  onCellFocus: () => void;
  onCellBlur: () => void;
  onCellChange: (field: keyof IVTTCue, value: IVTTCue[keyof IVTTCue]) => void;
  onDoubleCellClick: (field: keyof IVTTCue) => void;
}
export interface ISubtitleTableRowState {}

export class SubtitleTableRow extends React.Component<
  ISubtitleTableRowProps,
  ISubtitleTableRowState
> {
  protected rowEl: HTMLTableRowElement | null = null;

  constructor(props: ISubtitleTableRowProps) {
    super(props);
    this.state = this.getInitialState();
  }

  getInitialState(): ISubtitleTableRowState {
    return {
      editField: null,
    };
  }

  handleRowMouseDown = (event: React.MouseEvent<HTMLTableRowElement>) => {
    if (!this.props.active) {
      this.props.onClick(this.props.cue);
    }
  };

  handleChange = (value: IVTTCue[keyof IVTTCue], field: keyof IVTTCue) => {
    this.props.onCellChange(field, value);
  };

  handleCellDoubleClick = (field: keyof IVTTCue) => {
    if (this.props.active && this.props.editField !== field) {
      this.props.onDoubleCellClick(field);
    }
  };

  handleCellBlur = () => {
    this.props.onCellBlur();
  };

  handleCellFocus = () => {
    this.props.onCellFocus();
  };

  render() {
    const cue = this.props.cue;

    return (
      <StyledRow
        key={cue.uuid}
        active={this.props.active}
        ref={(el) => (this.rowEl = el)}
        onMouseDown={this.handleRowMouseDown}
      >
        <td>{cue.startTime}</td>
        <td>{cue.endTime}</td>
        <td>{toFixedNumber(cue.endTime - cue.startTime, 3)}</td>
        <TextAreaEditableCell
          edit={this.props.active && this.props.editField === "text"}
          cue={cue}
          field="text"
          onBlur={this.handleCellBlur}
          onFocus={this.handleCellFocus}
          onChange={this.handleChange}
          onDoubleClick={this.handleCellDoubleClick}
        />
      </StyledRow>
    );
  }
}

const StyledRow = styled("tr", {
  name: "Row",
  shouldForwardProp: (prop) => prop !== "active",
})<{ active: boolean }>(({ active, theme }) => {
  return {
    // outline: "none",
    ...(active && {
      td: {
        backgroundColor: theme.palette.primary.plainActiveBg,
      },
    }),
  };
});
