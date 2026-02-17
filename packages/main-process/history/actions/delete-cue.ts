import { UndoableAction, redo, undo, UndoableActionState } from "./action";
import { assert } from "@sculptor/helpers/assert";
import { IVTTCue } from "@sculptor/helpers/vtt";

export class DeleteCueAction implements UndoableAction {
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

  @undo
  undo(): void {
    this.options.insertCue(this.cue, this.savedCueIndex);
  }

  @redo
  redo(): void {
    this.options.deleteCue(this.cue.uuid);
  }
}
