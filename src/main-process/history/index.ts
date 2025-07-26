import { IVTTCue } from "shared/libs/vtt/vttcue";
import { IUndoableAction, UndoableActionState } from "./actions/action";

export class HistoryManager {
  protected list: IUndoableAction[] = [];

  public undo(cues: IVTTCue[]) {
    const item = this.list.findLast(
      (item) => item.state === UndoableActionState.Undoable,
    );

    if (!item) {
      console.log("No undoable action found");
      return;
    }

    item.undo(cues);
  }

  public redo(cues: IVTTCue[]) {
    const item = this.list.find(
      (item) => item.state === UndoableActionState.Redoable,
    );

    if (!item) {
      console.log("No redoable action found");
      return;
    }

    item.redo(cues);
  }

  public push(action: IUndoableAction) {
    this.list = this.list.filter(
      (item) => item.state === UndoableActionState.Undoable,
    );

    this.list.push(action);
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
