import { IVTTCue } from "shared/libs/vtt/vttcue";
import { IVTTRegion } from "shared/libs/vtt/vttregion";
import { assert } from "shared/assert";
import {
  IPlaceholderCue,
  isNotPlaceholderCue,
  isPlaceholderCue,
} from "./placeholderCue";
import { mutableMergeVttCues } from "shared/mergeVttObjects";

export class SubtitlesStore {
  protected file: string | null = null;
  protected cues: (IVTTCue | IPlaceholderCue)[] = [];
  protected regions: Record<string, IVTTRegion> = {};
  protected styles: string[] = [];
  protected activeCues = new Set<IVTTCue["uuid"]>();

  protected _lastClickedCue: IVTTCue["uuid"] | null = null;
  protected get lastClickedCue() {
    return (
      this._lastClickedCue ??
      this.cues.filter(isNotPlaceholderCue).at(0)?.uuid ??
      null
    );
  }
  protected set lastClickedCue(value: IVTTCue["uuid"] | null) {
    this._lastClickedCue = value;
  }

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

  public setStyles(styles: string[]) {
    this.styles = styles;
  }

  public getStyles() {
    return this.styles;
  }

  public getActiveCue() {
    return this.activeCues;
  }

  public getActiveCueArray() {
    return [...this.activeCues];
  }

  public setActiveCue(
    clickedCueUuid: IVTTCue["uuid"],
    modifiers: { shiftKey: boolean; ctrlKey: boolean },
  ) {
    if (this.lastClickedCue) {
      const cuesUuid = this.cues.filter(isNotPlaceholderCue).map((c) => c.uuid);
      const lastClickedCueIndex = cuesUuid.indexOf(this.lastClickedCue);
      const clickedCueUuidIndex = cuesUuid.indexOf(clickedCueUuid);

      if (lastClickedCueIndex === -1 || clickedCueUuidIndex === -1) {
        console.error("lastClickedCueIndex or clickedCueUuidIndex is -1", {
          clickedCueUuidIndex,
          lastClickedCueIndex,
        });
        return;
      }

      if (modifiers.shiftKey) {
        if (clickedCueUuidIndex < lastClickedCueIndex) {
          for (let i = clickedCueUuidIndex; i <= lastClickedCueIndex; i++) {
            if (
              this.activeCues.has(cuesUuid[i]) &&
              cuesUuid[i] !== clickedCueUuid
            ) {
              this.activeCues.delete(cuesUuid[i]);
            } else {
              this.activeCues.add(cuesUuid[i]);
            }
          }
        } else {
          for (let i = lastClickedCueIndex; i <= clickedCueUuidIndex; i++) {
            this.activeCues.add(cuesUuid[i]);
          }
        }

        this.lastClickedCue = clickedCueUuid;
      } else if (modifiers.ctrlKey) {
        if (this.activeCues.has(clickedCueUuid)) {
          this.activeCues.delete(clickedCueUuid);
        } else {
          this.activeCues.add(clickedCueUuid);
        }
      } else {
        this.activeCues.clear();
        this.activeCues.add(clickedCueUuid);
        this.lastClickedCue = clickedCueUuid;
      }
    } else {
      console.warn("(!!! No last clicked cue found");
      this.lastClickedCue = clickedCueUuid;
    }
  }

  public toggleActiveCue(value: IVTTCue["uuid"]) {
    if (this.activeCues.has(value)) {
      this.activeCues.delete(value);
    } else {
      this.activeCues.add(value);
    }
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
          this.activeCues = new Set([cue.uuid]);
        } else {
          if (!isPlaceholderCue(cue)) {
            mutableMergeVttCues(existingCue, cue);
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
            this.activeCues = new Set([cue.uuid]);
          } else {
            this.cues.push(cue);
            this.activeCues = new Set([cue.uuid]);
          }
        }
      }
    }
  }

  public deleteCues(uuids: IVTTCue["uuid"][]) {
    this.cues = this.cues.filter((c) => !uuids.includes(c.uuid));
    this.activeCues = this.activeCues.difference(new Set(uuids));
  }
}
