import { IUndoableAction, UndoableActionState } from "./action";
import { assert } from "@sculptor/helpers/assert";
import type { IVTTCue } from "@sculptor/helpers/vtt";
import type { IMinimalPartialVTTCue } from "../../store/subtitles";

export class CuePatchAction implements IUndoableAction {
  public state = UndoableActionState.Undoable;

  constructor(
    protected originalCue: IVTTCue,
    protected patch: IMinimalPartialVTTCue,
    protected options: { patch: (cue: IMinimalPartialVTTCue) => void },
  ) {}

  undo() {
    assert(
      this.state === UndoableActionState.Undoable,
      "[undo] The aciton can not be undone",
    );

    this.options.patch(this.originalCue);

    this.state = UndoableActionState.Redoable;
  }

  redo() {
    assert(
      this.state === UndoableActionState.Redoable,
      "[redo] The aciton can not be redone",
    );

    this.options.patch(this.patch);

    this.state = UndoableActionState.Undoable;
  }
}
