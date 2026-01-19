import { IUndoableAction, UndoableActionState } from "./actions/action";

export class HistoryManager {
  protected list: IUndoableAction[] = [];

  public undo() {
    const item = this.list.findLast(
      (item) => item.state === UndoableActionState.Undoable,
    );

    if (!item) {
      console.log("No undoable action found");
      return;
    }

    item.undo();
  }

  public redo() {
    const item = this.list.find(
      (item) => item.state === UndoableActionState.Redoable,
    );

    if (!item) {
      console.log("No redoable action found");
      return;
    }

    item.redo();
  }

  public push(action: IUndoableAction) {
    this.list = this.list.filter(
      (item) => item.state === UndoableActionState.Undoable,
    );

    this.list.push(action);
  }

  public clear() {
    this.list = [];
  }

  public getLatestUndoableAction() {
    return (
      this.list.findLast(
        (action) => action.state === UndoableActionState.Undoable,
      ) ?? null
    );
  }

  public getLatestRedoableAction() {
    return (
      this.list.find(
        (action) => action.state === UndoableActionState.Redoable,
      ) ?? null
    );
  }
}
