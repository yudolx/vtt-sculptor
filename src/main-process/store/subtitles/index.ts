import { IVTTCue } from "shared/libs/vtt/vttcue";
import { IVTTRegion } from "shared/libs/vtt/vttregion";

import { BaseStore } from "../base";
import { assert } from "shared/assert";

export interface ISubtitlesStoreState {
  file: string | null;
  cues: IVTTCue[];
  regions: Record<string, IVTTRegion>;
}

export class SubtitlesStore extends BaseStore<ISubtitlesStoreState> {
  protected file: string | null = null;
  protected cues: IVTTCue[] = [];
  protected regions: Record<string, IVTTRegion> = {};

  public getState() {
    return {
      file: this.file,
      cues: this.cues,
      regions: this.regions,
    };
  }

  public patchCues(changedCues: IVTTCue[]) {
    for (const cue of changedCues) {
      const existingCue = this.cues.find(
        (stateCue) => stateCue.uuid === cue.uuid,
      );

      if (!existingCue) {
        continue;
      }

      existingCue.text = cue.text;
    }
    return true;
  }

  public setFile(file: string | null) {
    this.file = file;
  }

  public setCues(cues: IVTTCue[]) {
    this.cues = cues;
  }

  public setRegions(regions: Record<string, IVTTRegion>) {
    this.regions = regions;
  }

  public insertCue(cue: IVTTCue) {
    const suitableIndex =
      this.cues.length > 0
        ? this.cues.findLastIndex((c) => c.startTime <= cue.startTime)
        : 0;

    assert(
      typeof suitableIndex === "number" && suitableIndex !== -1,
      `Unable to find suitable index for the new cue`,
    );

    this.cues.splice(suitableIndex + 1, 0, cue);
  }
}
