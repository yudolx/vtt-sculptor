import { Table } from "@mui/joy";
import React from "react";

export interface ISubtitleTableProps {}
export interface ISubtitleTableState {}

export class SubtitleTable extends React.Component<
  ISubtitleTableProps,
  ISubtitleTableState
> {
  // constructor(props: ISubtitleTableProps) {
  //   super(props);
  // }

  render() {
    return (
      <Table>
        <thead>
          <tr>
            <th>Start</th>
            <th>End</th>
            <th>Text</th>
          </tr>
        </thead>
        <tbody></tbody>
      </Table>
    );
  }
}
