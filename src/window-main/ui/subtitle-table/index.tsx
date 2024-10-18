import React from "react";
import { Table, TableProps } from "@mui/joy";
import { ISubtitlesStoreState } from "main-process/store/subtitles/index";
import { IVTTCue } from "shared/libs/vtt/vttcue";
import { ISubtitleTableRowProps, SubtitleTableRow } from "./row";
import { assert } from "shared/assert";
import { toFixedNumber } from "shared/to-fixed-number";

export interface ISubtitleTableProps {
  cues: ISubtitlesStoreState["cues"];
  video: HTMLVideoElement | null;
}
export interface ISubtitleTableState {
  activeCueUuid: IVTTCue["uuid"] | null;
  editField: keyof IVTTCue | null;
}

const DEFAULT_ADJUST_TIME = 0.1;

export class SubtitleTable extends React.Component<
  ISubtitleTableProps,
  ISubtitleTableState
> {
  constructor(props: ISubtitleTableProps) {
    super(props);

    this.state = this.getInitialState();
  }

  getInitialState(): ISubtitleTableState {
    return {
      activeCueUuid: null,
      editField: null,
    };
  }

  get activeCueIndex() {
    return this.state.activeCueUuid
      ? this.props.cues.findIndex((c) => c.uuid === this.state.activeCueUuid)
      : -1;
  }

  get nextCue() {
    const activeCueIndex = this.state.activeCueUuid
      ? this.props.cues.findIndex((c) => c.uuid === this.state.activeCueUuid)
      : -1;

    const maxCueIndex = this.props.cues.length - 1;
    const nextActiveCue =
      activeCueIndex >= maxCueIndex ? maxCueIndex : activeCueIndex + 1;

    return this.props.cues[nextActiveCue];
  }

  get prevCue() {
    const activeCueIndex = this.state.activeCueUuid
      ? this.props.cues.findIndex((c) => c.uuid === this.state.activeCueUuid)
      : -1;

    const prevActiveCue = activeCueIndex <= 0 ? 0 : activeCueIndex - 1;

    return this.props.cues[prevActiveCue];
  }

  getActiveCue() {
    return (
      this.props.cues.find((c) => c.uuid === this.state.activeCueUuid) ?? null
    );
  }

  handleSubtitleTableRowClick = (cue: IVTTCue) => {
    if (this.state.activeCueUuid !== cue.uuid) {
      this.setState({
        activeCueUuid: cue.uuid,
      });
    }
  };

  handleSubtitleTableRowKeyDown: Required<TableProps>["onKeyDown"] = (
    event,
  ) => {
    const cue = this.getActiveCue();
    if (event.key === "Enter") {
      if (this.state.activeCueUuid) {
        this.setState({ editField: "text" });
      }
    } else if (event.key === "ArrowDown") {
      this.setState({ activeCueUuid: this.nextCue.uuid });
    } else if (event.key === "ArrowUp") {
      this.setState({ activeCueUuid: this.prevCue.uuid });
    } else if (event.key.toLocaleLowerCase() === "delete") {
      assert(cue, "Cue not found");

      this.setState({
        activeCueUuid: this.nextCue.uuid,
      });

      window.electronAPI.deleteCues([cue.uuid]);
    } else if (event.key.toLowerCase() === "q") {
      assert(this.props.video, "No video");
      assert(cue, "Cue not found");

      const newStartTime =
        cue.startTime - DEFAULT_ADJUST_TIME < 0
          ? 0
          : toFixedNumber(cue.startTime - DEFAULT_ADJUST_TIME, 3);

      window.electronAPI.cueChanged([{ ...cue, startTime: newStartTime }]);
    } else if (event.key.toLowerCase() === "w") {
      assert(this.props.video, "No video");
      assert(cue, "Cue not found");

      const newStartTime =
        cue.startTime + DEFAULT_ADJUST_TIME >= cue.endTime
          ? cue.endTime
          : toFixedNumber(cue.startTime + DEFAULT_ADJUST_TIME, 3);

      window.electronAPI.cueChanged([{ ...cue, startTime: newStartTime }]);
    } else if (event.key.toLowerCase() === "e") {
      assert(this.props.video, "No video");
      assert(cue, "Cue not found");

      const newEndTime =
        cue.endTime - DEFAULT_ADJUST_TIME <= cue.startTime
          ? cue.startTime
          : toFixedNumber(cue.endTime - DEFAULT_ADJUST_TIME, 3);

      window.electronAPI.cueChanged([{ ...cue, endTime: newEndTime }]);
    } else if (event.key.toLowerCase() === "r") {
      assert(this.props.video, "No video");
      assert(cue, "Cue not found");

      const newEndTime =
        cue.endTime + DEFAULT_ADJUST_TIME >= this.props.video.duration
          ? this.props.video.duration
          : toFixedNumber(cue.endTime + DEFAULT_ADJUST_TIME, 3);

      window.electronAPI.cueChanged([{ ...cue, endTime: newEndTime }]);
    } else {
    }
  };

  handleCellChange: ISubtitleTableRowProps["onCellChange"] = (field, value) => {
    const cue = this.getActiveCue();
    assert(cue, "No cue find");

    const newCue: IVTTCue = {
      ...cue,
      [field]: value,
    };

    window.electronAPI.cueChanged([newCue]);
  };

  handleDoubleCellClick: ISubtitleTableRowProps["onDoubleCellClick"] = (
    field,
  ) => {
    this.setState({
      editField: field,
    });
  };

  handleCellBlur: ISubtitleTableRowProps["onCellBlur"] = () => {
    this.setState({
      editField: null,
    });
    window.electronAPI.enableHotkeys();
  };

  handleCellFocus: ISubtitleTableRowProps["onCellFocus"] = () => {
    window.electronAPI.disableHotkeys();
  };

  render() {
    return (
      <Table
        stickyHeader
        stripe="odd"
        hoverRow
        onKeyDown={this.handleSubtitleTableRowKeyDown}
        tabIndex={1}
      >
        <thead>
          <tr>
            <th style={{ width: 85 }}>Start</th>
            <th style={{ width: 85 }}>End</th>
            <th style={{ width: 85 }}>Duration</th>
            <th>Text</th>
          </tr>
        </thead>
        <tbody>
          {this.props.cues.map((cue) => {
            return (
              <SubtitleTableRow
                editField={this.state.editField}
                key={cue.uuid}
                cue={cue}
                active={this.state.activeCueUuid === cue.uuid}
                onClick={this.handleSubtitleTableRowClick}
                onCellChange={this.handleCellChange}
                onDoubleCellClick={this.handleDoubleCellClick}
                onCellBlur={this.handleCellBlur}
                onCellFocus={this.handleCellFocus}
              />
            );
          })}
        </tbody>
      </Table>
    );
  }
}
