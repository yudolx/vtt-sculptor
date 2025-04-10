import { IVTTCue } from "shared/libs/vtt/vttcue";
import { IVTTRegion } from "shared/libs/vtt/vttregion";
import { assert } from "shared/assert";
import { IPlaceholderCue, isPlaceholderCue } from "./placeholderCue";

export class SubtitlesStore {
  protected file: string | null = null;
  protected cues: (IVTTCue | IPlaceholderCue)[] = [];
  protected regions: Record<string, IVTTRegion> = {};
  protected activeCue: IVTTCue["uuid"] | null = null;

  public getFile() {
    return this.file;
  }

  public setFile(file: string | null) {
    this.file = file;
  }

  public getRegions() {
    return this.regions;
  }

  public setRegions(regions: Record<string, IVTTRegion>) {
    this.regions = regions;
  }

  public getCues(): IVTTCue[];
  public getCues(cueUuid: IVTTCue["uuid"]): IVTTCue | null;
  public getCues(cueUuid?: IVTTCue["uuid"]) {
    if (cueUuid) {
      return this.cues.find((c) => c.uuid === cueUuid) ?? null;
    } else {
      return this.cues;
    }
  }

  public setCues(cues: IVTTCue[]) {
    this.cues = cues;
  }

  public getActiveCue() {
    return this.activeCue;
  }

  public setActiveCue(value: IVTTCue["uuid"]) {
    this.activeCue = value;
  }

  // ---------------------------------------------------------------------

  public patchOrInsertCues(cuesToPatch: (IVTTCue | IPlaceholderCue)[]) {
    for (const cue of cuesToPatch) {
      const existingCue = this.cues.find(
        (stateCue) => stateCue.uuid === cue.uuid,
      );
      const existingCueIndex = existingCue
        ? this.cues.indexOf(existingCue)
        : -1;

      if (existingCue) {
        // if the cue exist then patch it
        if (isPlaceholderCue(existingCue)) {
          this.cues.splice(existingCueIndex, 1, cue);
          this.activeCue = cue.uuid;
        } else {
          if (!isPlaceholderCue(cue)) {
            existingCue.text = cue.text;
            existingCue.startTime = cue.startTime;
            existingCue.endTime = cue.endTime;
          }
        }
      } else {
        // if the cue does not exist yet then we try to insert it
        if (isPlaceholderCue(cue)) {
          this.cues.unshift(cue);
        } else {
          const suitableIndex =
            this.cues.length > 0
              ? this.cues.findLastIndex(
                  (c) => !isPlaceholderCue(c) && c.startTime <= cue.startTime,
                )
              : 0;

          assert(
            typeof suitableIndex === "number" && suitableIndex !== -1,
            `Unable to find suitable index for the new cue`,
          );

          if (suitableIndex > 0) {
            this.cues.splice(suitableIndex + 1, 0, cue);
            this.activeCue = cue.uuid;
          } else {
            this.cues.push(cue);
            this.activeCue = cue.uuid;
          }
        }
      }
    }
  }

  public deleteCues(uuids: IVTTCue["uuid"][]) {
    this.cues = this.cues.filter((c) => !uuids.includes(c.uuid));
  }
}
