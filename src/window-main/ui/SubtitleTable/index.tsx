import React from "react";
import { Table } from "@mui/joy";
import { IVTTCue } from "shared/libs/vtt/vttcue";
import { SubtitleTableRow } from "./row";
import { ISubtitlesStoreState } from "main-process/store/subtitles";

export interface ISubtitleTableProps {
  cues: ISubtitlesStoreState["cues"];
}
export interface ISubtitleTableState {
  activeCue: IVTTCue["id"] | null;
}

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
      activeCue: null,
    };
  }

  handleSubtitleTableRowClick = (cue: IVTTCue) => {
    if (this.state.activeCue !== cue.uuid) {
      this.setState({
        activeCue: cue.uuid,
      });
    }
  };

  renderRow = (cue: IVTTCue) => {
    return (
      <SubtitleTableRow
        key={cue.uuid}
        cue={cue}
        active={this.state.activeCue === cue.uuid}
        onClick={this.handleSubtitleTableRowClick}
      />
    );
  };

  render() {
    const cues = (this.props.cues ?? []) as IVTTCue[];
    return (
      <Table stickyHeader stripe="odd" hoverRow>
        <thead>
          <tr>
            <th style={{ width: 85 }}>Start</th>
            <th style={{ width: 85 }}>End</th>
            <th style={{ width: 85 }}>Duration</th>
            <th>Text</th>
          </tr>
        </thead>
        <tbody>{cues.map(this.renderRow)}</tbody>
      </Table>
    );
  }
}
