import { IVTTCue } from "shared/libs/vtt/vttcue";
import { IUndoableAction, UndoableActionState } from "./action";
import { assert } from "shared/assert";
import type { IMinimalPartialVTTCue } from "main-process/store/subtitles";

export class CuePatchAction implements IUndoableAction {
  public state = UndoableActionState.Undoable;

  constructor(
    protected originalCue: IVTTCue,
    protected patch: IMinimalPartialVTTCue,
    protected options: { patch: (cue: IMinimalPartialVTTCue) => void },
  ) {}

  undo(cues: IVTTCue[]) {
    assert(
      this.state === UndoableActionState.Undoable,
      "[undo] The aciton can not be undone",
    );

    this.options.patch(this.originalCue);

    this.state = UndoableActionState.Redoable;
  }

  redo(cues: IVTTCue[]) {
    assert(
      this.state === UndoableActionState.Redoable,
      "[redo] The aciton can not be redone",
    );

    this.options.patch(this.patch);

    this.state = UndoableActionState.Undoable;
  }
}
