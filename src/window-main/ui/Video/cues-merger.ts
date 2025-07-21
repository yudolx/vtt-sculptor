import { IVTTCue } from "shared/libs/vtt/vttcue";
import { VTTCueUuid } from "./vtt-cue-uuid";

export class CuesMerger {
  // public lasChangedCue: VTTCueUuid | null = null;
  public trackCues: VTTCueUuid[] = [];

  constructor(
    protected track: TextTrack,
    protected propCues: IVTTCue[],
  ) {
    this.trackCues = [...(track.cues ?? [])].filter(VTTCueUuid.is);

    this.deleteRemovedCues();
    this.updateExistingCues();

    // if (this.lasChangedCue && this.lasChangedCue.track) {
    //   this.lasChangedCue.track.mode = "hidden";
    //   this.lasChangedCue!.track!.mode = "showing";
    // }
  }

  deleteRemovedCues() {
    this.trackCues.forEach((tCue) => {
      if (!this.propCues.find((pCue) => tCue.uuid === pCue.uuid)) {
        this.track.removeCue(tCue);
      }
    });
  }

  updateExistingCues() {
    let atLeastOneCueChanged = false;
    // Update existing cues and add new
    this.propCues.forEach((propsCue) => {
      let cue: VTTCueUuid;
      const existingCue = this.trackCues.find(
        (tCue) => tCue.uuid === propsCue.uuid,
      );
      if (!existingCue) {
        cue = VTTCueUuid.createFromCueObj(propsCue);
        this.track.addCue(cue);
      } else {
        cue = existingCue;
      }

      const cueUpdateResult = cue.update(propsCue);
      atLeastOneCueChanged = atLeastOneCueChanged || cueUpdateResult;
      // this.lasChangedCue ??= this.mergeCueValues(cue, propsCue);

      // cue.id = propsCue.id;
      // cue.align = propsCue.align;
      // cue.line = propsCue.line;
      // cue.lineAlign = propsCue.lineAlign;
      // cue.position = propsCue.position;
      // cue.positionAlign = propsCue.positionAlign;
      // cue.size = propsCue.size;
      // cue.snapToLines = propsCue.snapToLines;
      // cue.vertical = propsCue.vertical;
      // cue.region = propsCue.region ? this.regions[propsCue.region] : null;
      // cue.text = propsCue.text;
      // cue.track = cue
    });

    if (atLeastOneCueChanged) {
      this.track.mode = "disabled";
      this.track.mode = "showing";
    }
  }
}
