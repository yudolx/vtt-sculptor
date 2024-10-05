import React from "react";
import { styled } from "@mui/joy";
import { IVTTCue } from "shared/libs/vtt/vttcue";
import { TextAreaEditableCell } from "./TextAreaEditableCell";

export interface ISubtitleTableRowProps {
  active: boolean;
  cue: IVTTCue;
  onClick: (cue: IVTTCue) => void;
}
export interface ISubtitleTableRowState {
  editField: keyof IVTTCue | null;
}

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

  handleChange = (value: string, field: keyof IVTTCue) => {
    const newCue = {
      ...this.props.cue,
      [field]: value,
    };
    window.electronAPI.cueChanged([newCue]);
  };

  handleFocus = () => {};

  handleBlur = () => {};

  handleCellMouseDown = (field: keyof IVTTCue) => {
    if (this.props.active) {
      this.setState({ editField: field });
    }
  };

  componentDidUpdate(
    prevProps: Readonly<ISubtitleTableRowProps>,
    prevState: Readonly<ISubtitleTableRowState>,
    snapshot?: any,
  ): void {
    if (prevProps.active === true && this.props.active === false) {
      this.setState({ editField: null });
    }
  }

  render() {
    const cue = this.props.cue;

    return (
      <StyledRow
        ref={(el) => (this.rowEl = el)}
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
        onMouseDown={this.handleRowMouseDown}
        active={this.props.active}
        key={cue.uuid}
      >
        <td>{cue.startTime}</td>
        <td>{cue.endTime}</td>
        <td>{(cue.endTime - cue.startTime).toFixed(3)}</td>
        <TextAreaEditableCell
          edit={this.state.editField === "text"}
          cue={cue}
          field="text"
          onBlur={() => {
            this.setState({ editField: null });
          }}
          onChange={this.handleChange}
          onMouseDown={this.handleCellMouseDown}
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
    ...(active && {
      td: {
        backgroundColor: theme.palette.primary.plainActiveBg,
      },
    }),
  };
});
