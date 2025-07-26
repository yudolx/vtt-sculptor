import { IVTTCue } from "shared/libs/vtt/vttcue";
import { IUndoableAction, UndoableActionState } from "./action";
import { assert } from "shared/assert";

export class DeleteCueAction implements IUndoableAction {
  public name: string = "delete cue";
  public state = UndoableActionState.Undoable;

  constructor(
    protected cue: IVTTCue,
    protected savedCueIndex: number,
    protected options: {
      insertCue: (cue: IVTTCue, index: number) => void;
      deleteCue: (cueUuid: IVTTCue["uuid"]) => void;
    },
  ) {
    assert(this.savedCueIndex !== -1, "Cue index can not be -1");
  }

  undo(cues: IVTTCue[]): void {
    assert(
      this.state === UndoableActionState.Undoable,
      `[redo ${this.name}] The aciton can not be undone`,
    );

    this.options.insertCue(this.cue, this.savedCueIndex);
    this.state = UndoableActionState.Redoable;
  }

  redo(cues: IVTTCue[]): void {
    assert(
      this.state === UndoableActionState.Redoable,
      `[redo ${this.name}] The aciton can not be redone`,
    );

    this.options.deleteCue(this.cue.uuid);
    this.state = UndoableActionState.Undoable;
  }
}
