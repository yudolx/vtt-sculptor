import { assert } from "@sculptor/helpers/assert";
import { UndoableAction, redo, undo, UndoableActionState } from "./action";
import { IVTTCue } from "@sculptor/helpers/vtt";
import type { SubtitlesStore } from "@sculptor/main-process/store/subtitles";

export class MergeDownCueAction implements UndoableAction {
  public state = UndoableActionState.Undoable;

  constructor(
    /** originally gets patched */
    protected activeCue: IVTTCue,
    /** originally gets removed */
    protected nextToActiveCue: IVTTCue,
    protected subtitles: SubtitlesStore,
  ) {}

  @undo
  undo() {
    const allCues = this.subtitles.getCues();

    const activeCueIndex = allCues.findIndex(
      (c) => c.uuid === this.activeCue.uuid,
    );

    assert(activeCueIndex !== -1, "active cue not found");

    this.subtitles.patch(this.activeCue);
    this.subtitles.insert(this.nextToActiveCue, activeCueIndex + 1);
  }

  @redo
  redo() {
    this.subtitles.patch({
      uuid: this.activeCue.uuid,
      text: `${this.activeCue.text} ${this.nextToActiveCue.text}`,
      endTime: this.nextToActiveCue.endTime,
    });
    this.subtitles.delete(this.nextToActiveCue.uuid);
  }
}
