import React from "react";
import clsx from "clsx";
import { styled } from "@mui/joy";
import { IVTTCue } from "shared/libs/vtt/vttcue";

export interface ISubtitleTableRowProps {
  active: boolean;
  cue: IVTTCue;
  onClick: (cue: IVTTCue) => void;
  onChange: (newCue: IVTTCue) => void;
}
export interface ISubtitleTableRowState {
  isEditing: boolean;
}

export class SubtitleTableRow extends React.Component<
  ISubtitleTableRowProps,
  ISubtitleTableRowState
> {
  protected rowEl: HTMLTableRowElement | null = null;

  handleClick = (event: React.MouseEvent<HTMLTableRowElement>) => {
    this.props.onClick(this.props.cue);
  };

  handleFocus = () => {};

  handleBlur = () => {};

  handleWindowClick = () => {};

  componentDidUpdate(
    prevProps: Readonly<ISubtitleTableRowProps>,
    prevState: Readonly<ISubtitleTableRowState>,
    snapshot?: any,
  ): void {}

  render() {
    const cue = this.props.cue;

    return (
      <Row
        ref={(el) => (this.rowEl = el)}
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
        onMouseDown={this.handleClick}
        active={this.props.active}
        key={cue.uuid}
      >
        <td>{cue.startTime}</td>
        <td>{cue.endTime}</td>
        <TextTd>{cue.text}</TextTd>
      </Row>
    );
  }
}

const TextTd = styled("td", { name: "TextTd" })(() => {
  return {
    whiteSpace: "pre",
  };
});

const Row = styled("tr", {
  name: "Row",
  shouldForwardProp: (prop) => prop !== "active",
})<{ active: boolean }>(({ active }) => {
  return {
    ...(active && {
      td: {
        backgroundColor: "red",
      },
    }),
  };
});
