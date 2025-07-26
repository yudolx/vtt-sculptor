import { IVTTCue } from "shared/libs/vtt/vttcue";
import { IVTTRegion } from "shared/libs/vtt/vttregion";
import { mutableMergeVttCues } from "shared/mergeVttObjects";
import {
  IAlterationModifiersPayload,
  MultipleSelectionModel,
} from "./multiple-selection-model";
import { arrayMove } from "@dnd-kit/sortable";

export class SubtitlesStore {
  protected file: string | null = null;
  protected cues: IVTTCue[] = [];
  protected regions: Record<string, IVTTRegion> = {};
  protected styles: string[] = [];
  protected selectionModel = new MultipleSelectionModel<IVTTCue["uuid"]>([]);
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

  public getSplittingCue() {
    return this.cues.find((c) => c.uuid === this.splittingCueId) ?? null;
  }

  public setSplittingCue(id: IVTTCue["uuid"] | null) {
    this.splittingCueId = id;
  }

  public alterCueSelection(
    cueArg: IVTTCue["uuid"] | null,
    modifiers: IAlterationModifiersPayload,
  ) {
    this.selectionModel.alterSelection(cueArg, modifiers);
  }

  public reoderCue(payload: { uuid: IVTTCue["uuid"]; over: IVTTCue["uuid"] }) {
    const fromIndex = this.cues.findIndex((cue) => cue.uuid === payload.uuid);
    const overIndex = this.cues.findIndex((cue) => cue.uuid === payload.over);

    this.cues = arrayMove(this.cues, fromIndex, overIndex);

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
      });

    if (this.cues.at(suitableIndex)?.startTime === cue.startTime) {
      suitableIndex += 1;
    }

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
