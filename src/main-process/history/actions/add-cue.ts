import { IVTTCue } from "@thulean-archives/shared/vtt/vttcue";
import { IUndoableAction, UndoableActionState } from "./action";
import { assert } from "shared/assert";

export class AddCueAction implements IUndoableAction {
  public state = UndoableActionState.Undoable;

  constructor(
    protected cue: IVTTCue,
    protected savedCueIndex: number,
    protected options: {
      insertCue: (cue: IVTTCue, index: number) => void;
      deleteCue: (cueUuid: IVTTCue["uuid"]) => void;
    },
  ) {}

  undo(): void {
    assert(
      this.state === UndoableActionState.Undoable,
      `[undo}] The aciton can not be undone`,
    );
    this.options.deleteCue(this.cue.uuid);
    this.state = UndoableActionState.Redoable;
  }

  redo(): void {
    assert(
      this.state === UndoableActionState.Redoable,
      `[redo}] The aciton can not be redone`,
    );

    this.options.insertCue(this.cue, this.savedCueIndex);
    this.state = UndoableActionState.Undoable;
  }
}
