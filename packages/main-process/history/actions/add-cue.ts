import { UndoableAction, redo, undo, UndoableActionState } from "./action";
import { IVTTCue } from "@sculptor/helpers/vtt";

export class AddCueAction implements UndoableAction {
  public state = UndoableActionState.Undoable;

  constructor(
    protected cue: IVTTCue,
    protected savedCueIndex: number,
    protected options: {
      insertCue: (cue: IVTTCue, index: number) => void;
      deleteCue: (cueUuid: IVTTCue["uuid"]) => void;
    },
  ) {}

  @undo
  undo(): void {
    this.options.deleteCue(this.cue.uuid);
  }

  @redo
  redo(): void {
    this.options.insertCue(this.cue, this.savedCueIndex);
  }
}
