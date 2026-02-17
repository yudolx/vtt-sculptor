import { UndoableAction, redo, undo, UndoableActionState } from "./action";
import type { IVTTCue } from "@sculptor/helpers/vtt";
import type { IMinimalPartialVTTCue } from "../../store/subtitles";

export class CuePatchAction implements UndoableAction {
  public state = UndoableActionState.Undoable;

  constructor(
    protected originalCue: IVTTCue,
    protected patch: IMinimalPartialVTTCue,
    protected options: { patch: (cue: IMinimalPartialVTTCue) => void },
  ) {}

  @undo
  undo() {
    this.options.patch(this.originalCue);
  }

  @redo
  redo() {
    this.options.patch(this.patch);
  }
}
