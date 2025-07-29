export enum UndoableActionState {
  Undoable,
  Redoable,
}

export interface IUndoableAction {
  state: UndoableActionState;
  undo(): void;
  redo(): void;
}
