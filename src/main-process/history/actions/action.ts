import { IVTTCue } from "shared/libs/vtt/vttcue";

export enum UndoableActionState {
  Undoable,
  Redoable,
}

export interface IUndoableAction {
  state: UndoableActionState;
  undo(cues: IVTTCue[]): void;
  redo(cues: IVTTCue[]): void;
}
