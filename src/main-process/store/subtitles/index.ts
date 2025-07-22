import { IVTTCue, mockVttCue } from "shared/libs/vtt/vttcue";
import { IVTTRegion } from "shared/libs/vtt/vttregion";
import { assert } from "shared/assert";
import {
  IPlaceholderCue,
  isNotPlaceholderCue,
  isPlaceholderCue,
} from "./placeholderCue";
import { mutableMergeVttCues } from "shared/mergeVttObjects";
import {
  IAlterationModifiersPayload,
  MultipleSelectionModel,
} from "./multiple-selection-model";
import { arrayMove } from "@dnd-kit/sortable";

export class SubtitlesStore {
  protected file: string | null = null;
  protected cues: (IVTTCue | IPlaceholderCue)[] = [];
  protected regions: Record<string, IVTTRegion> = {};
  protected styles: string[] = [];
  protected activeCues = new MultipleSelectionModel<IVTTCue["uuid"]>([]);

  protected splittingCueId: IVTTCue["uuid"] | null = null;

  // public sortCues(affectedCues?: IVTTCue["uuid"][]) {
  //   this.cues.sort((cueA, cueB) => {
  //     if (
  //       (affectedCues && affectedCues.length === 0) ||
  //       (affectedCues &&
  //         !affectedCues.includes(cueA.uuid) &&
  //         !affectedCues.includes(cueB.uuid)) ||
  //       isPlaceholderCue(cueA) ||
  //       isPlaceholderCue(cueB)
  //     ) {
  //       return 0;
  //     } else {
  //       return cueA.startTime - cueB.startTime;
  //     }
  //   });
  // }

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

    this.updateItemsForSelectionModel([]);
    // this.sortCues();
  }

  public setStyles(styles: string[]) {
    this.styles = styles;
  }

  public getStyles() {
    return this.styles;
  }

  public getActiveCues() {
    const activeCues = this.activeCues.getSelected();
    const cues = this.getCues();
    return activeCues.map((cueUuid) => {
      const cue = cues.find((c) => c.uuid === cueUuid);
      if (!cue) {
        console.log(`[getActiveCues] No cue with ${cueUuid} found.`);
      }
      return cue!;
    });
  }

  public getActiveCueArray() {
    return this.activeCues.getSelected();
  }

  public getSplittingCue() {
    return (
      this.cues
        .filter(isNotPlaceholderCue)
        .find((c) => c.uuid === this.splittingCueId) ?? null
    );
  }

  public setSplittingCue(id: IVTTCue["uuid"] | null) {
    this.splittingCueId = id;
  }

  public alterCueSelection(
    cueArg: IVTTCue["uuid"] | null,
    modifiers: IAlterationModifiersPayload,
  ) {
    this.activeCues.alterSelection(cueArg, modifiers);
  }

  public reoderCue(payload: { uuid: IVTTCue["uuid"]; over: IVTTCue["uuid"] }) {
    const fromIndex = this.cues.findIndex((cue) => cue.uuid === payload.uuid);
    const overIndex = this.cues.findIndex((cue) => cue.uuid === payload.over);

    this.cues = arrayMove(this.cues, fromIndex, overIndex);

    const renderableItems = this.cues.filter(isNotPlaceholderCue);
    this.activeCues.setItems(renderableItems.map((i) => i.uuid));
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

      let suitableIndex = this.cues.findLastIndex((c) => {
        return !isPlaceholderCue(c) && newCue.startTime >= c.startTime;
      });

      suitableIndex = suitableIndex !== -1 ? suitableIndex : 0;

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
          insertCue(cue);

          this.updateItemsForSelectionModel([cue.uuid]);
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
        this.updateItemsForSelectionModel([cue.uuid]);
      }
    }

    // this.sortCues(cuesArg.map((c) => c.uuid));
  }

  public deleteCues(uuids: IVTTCue["uuid"][]) {
    const latestCueIndex = Math.max(
      ...uuids.map((uuid) => this.cues.findIndex((cue) => cue.uuid === uuid)),
    );

    let latestAvailableCue = this.cues.at(latestCueIndex + 1);

    this.cues = this.cues.filter((c) => !uuids.includes(c.uuid));

    latestAvailableCue =
      latestAvailableCue ?? this.cues.at(this.cues.length - 1);

    this.updateItemsForSelectionModel(
      latestAvailableCue ? [latestAvailableCue.uuid] : undefined,
    );
  }

  public replaceCue(uuid: IVTTCue["uuid"], cues: IVTTCue[]) {
    const index = this.cues.findIndex((cue) => cue.uuid === uuid);

    if (index === -1) {
      console.warn(`No cue with uuid=${uuid} was found`);
      return;
    }

    this.cues.splice(index, 1, ...cues);
    this.updateItemsForSelectionModel();

    this.activeCues.removeSelection(uuid);
    if (this.activeCues.size() === 0) {
      this.activeCues.addSelection(cues[cues.length - 1].uuid);
    }
  }

  protected updateItemsForSelectionModel(selected?: IVTTCue["uuid"][]) {
    this.activeCues.setItems(
      this.cues.filter(isNotPlaceholderCue).map((i) => i.uuid),
      selected,
    );
  }
}

export interface IPatchCuePayload extends Partial<IVTTCue> {
  uuid: IVTTCue["uuid"];
}
