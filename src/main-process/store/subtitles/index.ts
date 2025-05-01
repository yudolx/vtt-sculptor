import { IVTTCue, mockVttCue } from "shared/libs/vtt/vttcue";
import { IVTTRegion } from "shared/libs/vtt/vttregion";
import { assert } from "shared/assert";
import {
  IPlaceholderCue,
  isNotPlaceholderCue,
  isPlaceholderCue,
} from "./placeholderCue";
import { mutableMergeVttCues } from "shared/mergeVttObjects";
import { safeHasOwnProperty } from "shared/safe-has-own-property";

export class SubtitlesStore {
  protected file: string | null = null;
  protected cues: (IVTTCue | IPlaceholderCue)[] = [];
  protected regions: Record<string, IVTTRegion> = {};
  protected styles: string[] = [];
  protected activeCues = new Set<IVTTCue["uuid"]>();

  protected _lastClickedCue: IVTTCue | null = null;
  protected get lastClickedCue() {
    return (
      this._lastClickedCue ??
      this.cues.filter(isNotPlaceholderCue).at(0) ??
      null
    );
  }
  protected set lastClickedCue(value: IVTTCue | null) {
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

  public setActiveCue(clickedCueUuid: IVTTCue["uuid"][]) {
    this.activeCues = new Set(clickedCueUuid);
    this.lastClickedCue = null; // TOOD:
  }

  public alterCueSelection(
    cueArg: IVTTCue["uuid"] | null,
    modifiers: {
      shiftKey: boolean;
      ctrlKey: boolean;
      key?: "ArrowUp" | "ArrowDown";
    },
  ) {
    assert(this.lastClickedCue, "No last clicked cue found");

    const allCues = this.cues.filter(isNotPlaceholderCue);
    const cueArgCue = cueArg
      ? (allCues.find((c) => c.uuid === cueArg) ?? null)
      : null;
    const lastClickedCueIndex = allCues.indexOf(this.lastClickedCue);
    const clickedCueUuidIndex = allCues.findIndex((c) => c.uuid === cueArg);

    const seekNextInactiveCue = () => {
      for (let i = lastClickedCueIndex; i < allCues.length; i++) {
        if (!this.activeCues.has(allCues[i].uuid)) {
          return allCues[i];
        }
      }
    };

    const findClosestCue = (cueUuidArg: IVTTCue["uuid"], active?: boolean) => {
      const cueIndex = allCues.findIndex((c) => c.uuid === cueUuidArg);
      assert(cueIndex !== -1, "Cue with specified uuid was not found");

      let counter = 1;
      let swapSign = false;
      while (counter < allCues.length * 2) {
        const index = cueIndex + (swapSign ? -counter : counter);

        if (allCues[index]) {
          if (
            (active && this.activeCues.has(allCues[index].uuid)) ||
            (!active && !this.activeCues.has(allCues[index].uuid))
          ) {
            return allCues[index];
          }
        } else {
          if (swapSign) {
            counter += 1;
          }
          swapSign = !swapSign;
        }
      }

      return allCues[cueIndex];
    };

    if (modifiers.shiftKey) {
      if (cueArg && cueArgCue) {
        for (
          let i = Math.min(lastClickedCueIndex, clickedCueUuidIndex);
          i < Math.max(lastClickedCueIndex, clickedCueUuidIndex);
          i++
        ) {
          this.activeCues.add(allCues[i].uuid);
        }

        this.lastClickedCue = cueArgCue;
      } else if (safeHasOwnProperty(modifiers, "key")) {
        if (modifiers.key === "ArrowDown") {
          const nextInactiveCue = seekNextInactiveCue();
          if (nextInactiveCue) {
            this.activeCues.add(nextInactiveCue.uuid);
            this.lastClickedCue = nextInactiveCue;
          }
        }
      }
    } else if (modifiers.ctrlKey && cueArg) {
      if (this.activeCues.has(cueArg)) {
        this.activeCues.delete(cueArg);
      } else {
        this.activeCues.add(cueArg);
        this.lastClickedCue = cueArgCue;
      }
    } else {
      this.activeCues.clear();
      if (cueArg && cueArgCue) {
        this.activeCues.add(cueArg);
        this.lastClickedCue = cueArgCue;
      }
    }

    // if (this.lastClickedCue) {
    //   const cuesUuid = this.cues.filter(isNotPlaceholderCue).map((c) => c.uuid);
    //   const lastClickedCueIndex = cuesUuid.indexOf(this.lastClickedCue);
    //   const clickedCueUuidIndex = cuesUuid.indexOf(clickedCueUuid);

    //   if (lastClickedCueIndex === -1 || clickedCueUuidIndex === -1) {
    //     console.error("lastClickedCueIndex or clickedCueUuidIndex is -1", {
    //       clickedCueUuidIndex,
    //       lastClickedCueIndex,
    //     });
    //     return;
    //   }

    //   if (modifiers.shiftKey) {
    //     if (clickedCueUuidIndex < lastClickedCueIndex) {
    //       for (let i = clickedCueUuidIndex; i <= lastClickedCueIndex; i++) {
    //         if (
    //           this.activeCues.has(cuesUuid[i]) &&
    //           cuesUuid[i] !== clickedCueUuid
    //         ) {
    //           this.activeCues.delete(cuesUuid[i]);
    //         } else {
    //           this.activeCues.add(cuesUuid[i]);
    //         }
    //       }
    //     } else {
    //       for (let i = lastClickedCueIndex; i <= clickedCueUuidIndex; i++) {
    //         this.activeCues.add(cuesUuid[i]);
    //       }
    //     }

    //     this.lastClickedCue = clickedCueUuid;
    //   } else if (modifiers.ctrlKey) {
    //     if (this.activeCues.has(clickedCueUuid)) {
    //       this.activeCues.delete(clickedCueUuid);
    //     } else {
    //       this.activeCues.add(clickedCueUuid);
    //     }
    //   } else {
    //     this.activeCues.clear();
    //     this.activeCues.add(clickedCueUuid);
    //     this.lastClickedCue = clickedCueUuid;
    //   }
    // } else {
    //   console.warn("(!!! No last clicked cue found");
    //   this.lastClickedCue = clickedCueUuid;
    // }
  }

  public toggleActiveCue(value: IVTTCue["uuid"]) {
    if (this.activeCues.has(value)) {
      this.activeCues.delete(value);
    } else {
      this.activeCues.add(value);
    }
  }

  // ---------------------------------------------------------------------

  public patchOrInsertCues(cuesArg: (IPatchCuePayload | IPlaceholderCue)[]) {
    const insertCue = (cueArg: IPatchCuePayload) => {
      const newCue = mockVttCue({
        startTime: 0,
        endTime: 0,
        text: "",
        ...cueArg,
      });
      const suitableIndex =
        this.cues.length > 0
          ? this.cues.findLastIndex(
              (c) => !isPlaceholderCue(c) && c.startTime <= newCue.startTime,
            )
          : 0;

      assert(
        typeof suitableIndex === "number" && suitableIndex !== -1,
        `Unable to find suitable index for the new cue`,
      );

      if (suitableIndex >= 0) {
        this.cues.splice(suitableIndex + 1, 0, newCue);
      } else {
        this.cues.push(newCue);
      }
    };

    for (const cue of cuesArg) {
      const existingCue = this.cues.find(
        (stateCue) => stateCue.uuid === cue.uuid,
      );
      const existingCueIndex = existingCue
        ? this.cues.indexOf(existingCue)
        : -1;

      if (existingCue) {
        if (isPlaceholderCue(existingCue) && !isPlaceholderCue(cue)) {
          this.cues.splice(existingCueIndex, 1);
          console.log(cue.uuid);
          insertCue(cue);
          this.activeCues = new Set([cue.uuid]);
        } else if (!isPlaceholderCue(existingCue) && !isPlaceholderCue(cue)) {
          mutableMergeVttCues(existingCue, cue);
        }
      } else {
        // if the cue does not exist yet then we try to insert it
        if (isPlaceholderCue(cue)) {
          this.cues.unshift(cue);
          return;
        }

        insertCue(cue);
        this.activeCues = new Set([cue.uuid]);
      }
    }
  }

  public deleteCues(uuids: IVTTCue["uuid"][]) {
    const latestCueIndex = Math.max(
      ...uuids.map((uuid) => this.cues.findIndex((cue) => cue.uuid === uuid)),
    );

    let latestAvailableCue = this.cues.at(latestCueIndex + 1);

    this.cues = this.cues.filter((c) => !uuids.includes(c.uuid));

    latestAvailableCue =
      latestAvailableCue ?? this.cues.at(this.cues.length - 1);

    this.activeCues.clear();
    if (latestAvailableCue) {
      this.activeCues.add(latestAvailableCue.uuid);
    }

    if (this.lastClickedCue && uuids.includes(this.lastClickedCue.uuid)) {
      this.lastClickedCue = null;
    }
  }
}

export interface IPatchCuePayload extends Partial<IVTTCue> {
  uuid: IVTTCue["uuid"];
}
