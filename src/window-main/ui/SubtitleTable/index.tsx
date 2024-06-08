import React from "react";
import { Table } from "@mui/joy";
import { ISubtitlesSliceState } from "main-process/store/subtitles/slice";
import { IVTTCue } from "shared/libs/vtt/vttcue";
import { SubtitleTableRow } from "./row";

export interface ISubtitleTableProps {
  cues: ISubtitlesSliceState["cues"];
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
    if (this.state.activeCue !== cue.id) {
      this.setState({
        activeCue: cue.id,
      });
    }
  };

  renderRow = (cue: IVTTCue) => {
    return (
      <SubtitleTableRow
        key={cue.id}
        cue={cue}
        active={this.state.activeCue === cue.id}
        onChange={() => {}}
        onClick={this.handleSubtitleTableRowClick}
      />
    );
  };

  render() {
    const cues = (this.props.cues ?? []) as IVTTCue[];
    return (
      <Table>
        <thead>
          <tr>
            <th>Start</th>
            <th>End</th>
            <th>Text</th>
          </tr>
        </thead>
        <tbody>{cues.map(this.renderRow)}</tbody>
      </Table>
    );
  }
}
