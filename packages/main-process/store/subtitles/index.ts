import type { IVTTCue, IVTTRegion } from "@sculptor/helpers/vtt";
import { mutableMergeVttCues } from "@sculptor/helpers/mergeVttObjects";
import {
  IAlterationModifiersPayload,
  MultipleSelectionModel,
} from "./multiple-selection-model";
import { arrayMove } from "@dnd-kit/sortable";

export interface ISplitCueData {
  uuid: IVTTCue["uuid"];
  time?: number;
}

export interface ISplitCueIpcData {
  cue: IVTTCue;
  time?: number;
}

export class SubtitlesStore {
  protected file: string | null = null;
  protected cues: IVTTCue[] = [];
  protected regions: Record<string, IVTTRegion> = {};
  protected styles: string[] = [];
  protected selectionModel = new MultipleSelectionModel<IVTTCue["uuid"]>([]);
  protected splitCueData: ISplitCueData | null = null;

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
    const activeCues = this.selectionModel.getSelected();
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
    return this.selectionModel.getSelected();
  }

  public getSplitCueData(): ISplitCueIpcData | null {
    if (!this.splitCueData) return null;
    const cue =
      this.cues.find((c) => c.uuid === this.splitCueData?.uuid) ?? null;

    if (cue) {
      return {
        cue,
        time: this.splitCueData.time,
      };
    }

    return null;
  }

  public setSplitCueData(data: ISplitCueData | null) {
    this.splitCueData = data;
  }

  public alterCueSelection(
    cueArg: IVTTCue["uuid"] | null,
    modifiers: IAlterationModifiersPayload,
  ) {
    this.selectionModel.alterSelection(cueArg, modifiers);
  }

  public reoderCue(index: number, overIndex: number) {
    this.cues = arrayMove(this.cues, index, overIndex);
    this.selectionModel.setItems(this.cues.map((i) => i.uuid));
  }

  public patch(cue: IMinimalPartialVTTCue) {
    const existingCue = this.cues.find(
      (stateCue) => stateCue.uuid === cue.uuid,
    );

    if (existingCue) {
      mutableMergeVttCues(existingCue, cue);
      return existingCue;
    } else {
      console.log(`[patchCue] No cue with uuid=${cue.uuid} found. Skipping`);
      return null;
    }
  }

  public insert(cue: IVTTCue, index?: number) {
    let suitableIndex =
      index ??
      this.cues.findLastIndex((c) => {
        return cue.startTime >= c.startTime;
      }) + 1; // +1 because we want to insert the cue AFTER the cue we found in findLastIndex

    suitableIndex = Math.max(0, suitableIndex);
    this.cues.splice(suitableIndex, 0, cue);
    this.updateItemsForSelectionModel([cue.uuid]);

    return suitableIndex;
  }

  public delete(uuid: IVTTCue["uuid"]) {
    const index = this.cues.findIndex((c) => c.uuid === uuid);

    if (index !== -1) {
      this.cues.splice(index, 1);
    }

    console.log("DELETING CUES", uuid);
    this.updateItemsForSelectionModel([]);

    return index;
  }

  public updateItemsForSelectionModel(selected?: IVTTCue["uuid"][]) {
    this.selectionModel.setItems(
      this.cues.map((i) => i.uuid),
      selected,
    );
  }
}

export interface IMinimalPartialVTTCue extends Partial<IVTTCue> {
  uuid: IVTTCue["uuid"];
}
