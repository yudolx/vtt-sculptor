import { IVTTCue } from "shared/libs/vtt/vttcue";
import { VTTCueUuid } from "./VttCueUuid";

export class CuesMerger {
  public lasChangedCue: VTTCueUuid | null = null;
  public trackCues: VTTCueUuid[] = [];

  constructor(
    protected track: TextTrack,
    protected propCues: IVTTCue[],
  ) {
    this.trackCues = [...(track.cues ?? [])].filter(VTTCueUuid.is);

    this.deleteRemovedCues();
    this.updateExistingCues();

    if (this.lasChangedCue && this.lasChangedCue.track) {
      this.lasChangedCue.track.mode = "hidden";
      this.lasChangedCue!.track!.mode = "showing";
    }
  }

  deleteRemovedCues() {
    this.trackCues.forEach((tCue) => {
      if (!this.propCues.find((pCue) => tCue.uuid === pCue.uuid)) {
        this.track.removeCue(tCue);
      }
    });
  }

  updateExistingCues() {
    // Update existing cues and add new
    this.propCues.forEach((propsCue) => {
      let cue: VTTCueUuid;
      const existingCue = this.trackCues.find(
        (tCue) => tCue.uuid === propsCue.uuid,
      );
      if (!existingCue) {
        cue = new VTTCueUuid(
          propsCue.startTime,
          propsCue.endTime,
          propsCue.text,
          propsCue.uuid,
        );
        this.track.addCue(cue);
      } else {
        cue = existingCue;
      }

      this.lasChangedCue ??= this.mergeCueValues(cue, propsCue);

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
  }

  mergeCueValues = (cue: VTTCueUuid, obj: IVTTCue) => {
    let changed = false;
    const keys = [
      "id",
      "align",
      "line",
      // TODO: NOT SUPPORTED BY CHROME
      // "lineAlign",
      "position",
      // TODO: NOT SUPPORTED BY CHROME
      // "positionAlign",
      "size",
      "snapToLines",
      "vertical",
      "text",
    ] as const;

    for (const key of keys) {
      if (cue[key] !== obj[key]) {
        console.log(key, cue[key], obj[key], cue);
        // @ts-expect-error
        cue[key] = obj[key];
        changed = true;
      }
    }

    if (changed) {
      return cue;
    } else {
      return null;
    }
  };
}
