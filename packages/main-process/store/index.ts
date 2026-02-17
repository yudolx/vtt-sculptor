import { VideoStore } from "./video";
import {
  IMinimalPartialVTTCue,
  ISplitCueData,
  SubtitlesStore,
} from "./subtitles";
import { IVTTCue, IVTTRegion } from "@sculptor/helpers/vtt";
import { QueryKey } from "@sculptor/helpers/constants";
import { assert } from "@sculptor/helpers/assert";
import { deepClone } from "@sculptor/helpers/deep-clone";
import { areEqual } from "@sculptor/helpers/array";
import type { BackgroundProcess } from "../background-process";
import { HistoryManager } from "../history";
import { AddCueAction } from "../history/actions/add-cue";
import { CuePatchAction } from "../history/actions/cue-patch";
import { DeleteCueAction } from "../history/actions/delete-cue";
import { ReorderCueAction } from "../history/actions/reorder-cue";
import { MergeDownCueAction } from "../history/actions/merge-down";

interface IActionOptions {
  /** send update query requests to the client or not */
  query?: boolean;
  /** push history object to the stack or not */
  history?: boolean;
}

export class ApplicationStore {
  public video = new VideoStore();
  public subtitles = new SubtitlesStore();
  public historyManager = new HistoryManager();

  constructor(protected app: BackgroundProcess) {}

  public undo() {
    this.historyManager.undo();
  }

  public redo() {
    this.historyManager.redo();
  }

  public setVideoPath(value: string | null) {
    this.video.setPath(value);
    this.app.invalidateQuery(QueryKey.VideoPath);
  }

  public setVideoSubtitlesVisible(value: boolean) {
    this.video.setSubtitlesVisible(value);
    this.app.window.updateMenu();
    this.app.invalidateQuery(QueryKey.VideoPath);
  }

  public setFileAndCues(payload: {
    cues: IVTTCue[];
    regions: Record<string, IVTTRegion>;
    styles: string[];
    file: string | null;
  }) {
    this.subtitles.setCues(payload.cues);
    this.subtitles.setRegions(payload.regions);
    this.subtitles.setFile(payload.file);
    this.subtitles.setStyles(payload.styles);
    this.historyManager.clear();

    this.app.invalidateQuery(QueryKey.VideoPath);
    this.app.invalidateQuery(QueryKey.CuesList);
    this.app.invalidateQuery(QueryKey.RegionsList);
    this.app.invalidateQuery(QueryKey.Styles);
  }

  public insertCue(cue: IVTTCue) {
    const index = this.subtitles.insert(cue);

    this.historyManager.push(
      new AddCueAction(cue, index, {
        deleteCue: (...args) => this.subtitles.delete(...args),
        insertCue: (...args) => this.subtitles.insert(...args),
      }),
    );

    this.app.window.updateMenu();
    this.app.invalidateQuery(QueryKey.CuesList);
    this.app.invalidateQuery(QueryKey.ActiveCue);
  }

  public patchCues(cues: IMinimalPartialVTTCue[], silent = false) {
    for (const cue of cues) {
      const fullCue = this.subtitles.getCues(cue.uuid);
      assert(fullCue, "Full cue not found");

      this.historyManager.push(
        new CuePatchAction(deepClone(fullCue), deepClone(cue), {
          patch: (...args) => this.subtitles.patch(...args),
        }),
      );

      this.subtitles.patch(cue);
    }

    this.app.window.updateMenu();
    if (!silent) {
      this.app.invalidateQuery(QueryKey.CuesList);
      this.app.invalidateQuery(QueryKey.ActiveCue);
    }
  }

  public replaceCue(cueUuid: IVTTCue["uuid"], replaceWithCue: IVTTCue[]) {
    const cues = this.subtitles.getCues();
    const cue = cues.find((c) => c.uuid === cueUuid);

    assert(cue, "[replaceCue] No cue found");

    let index = this.subtitles.delete(cueUuid);
    this.historyManager.push(
      new DeleteCueAction(cue, index, {
        deleteCue: (...args) => this.subtitles.delete(...args),
        insertCue: (...args) => this.subtitles.insert(...args),
      }),
    );

    for (const replaceCue of replaceWithCue) {
      index = this.subtitles.insert(replaceCue, index);

      this.historyManager.push(
        new AddCueAction(deepClone(replaceCue), index, {
          deleteCue: (...args) => this.subtitles.delete(...args),
          insertCue: (...args) => this.subtitles.insert(...args),
        }),
      );

      index += 1;
    }

    this.app.window.updateMenu();
    this.app.invalidateQuery(QueryKey.CuesList);
    this.app.invalidateQuery(QueryKey.ActiveCue);
  }

  public deleteCues(uuids: IVTTCue["uuid"][], silent = false) {
    let latestCueIndex: number = -1;
    const cues = this.subtitles.getCues();

    for (const uuid of uuids) {
      const cue = cues.find((c) => c.uuid === uuid);
      const index = this.subtitles.delete(uuid);

      assert(cue, "[deleteCues] No cue found");

      this.historyManager.push(
        new DeleteCueAction(deepClone(cue), index, {
          deleteCue: (...args) => this.subtitles.delete(...args),
          insertCue: (...args) => this.subtitles.insert(...args),
        }),
      );

      latestCueIndex = Math.max(latestCueIndex, index);
    }

    const latestAvailableCueIndex = Math.min(latestCueIndex, cues.length - 1);
    const latestAvailableCue = cues.at(latestAvailableCueIndex);

    if (latestAvailableCue) {
      this.subtitles.updateItemsForSelectionModel([latestAvailableCue.uuid]);
    } else {
      this.subtitles.updateItemsForSelectionModel([]);
    }

    this.app.window.updateMenu();
    if (!silent) {
      this.app.invalidateQuery(QueryKey.CuesList);
      this.app.invalidateQuery(QueryKey.ActiveCue);
    }
  }

  public mergeDownCue() {
    const allCues = this.subtitles.getCues();
    const activeCues = this.subtitles.getActiveCues();
    if (activeCues.length !== 1) {
      console.log("Ignoring merge down because more than 1 cue is selected");
      return;
    }

    const activeCue = deepClone(activeCues.at(0)!);
    const activeCueIndex = allCues.findIndex((c) => c.uuid === activeCue.uuid);
    assert(activeCueIndex !== -1, "activeCueIndex not found");

    const nextToActiveCue = deepClone(allCues.at(activeCueIndex + 1));
    if (!nextToActiveCue) {
      console.log(
        "Ignoring merge down because there is nothing to merge the selected cue with",
      );
      return;
    }

    this.subtitles.patch({
      uuid: activeCue.uuid,
      text: `${activeCue.text} ${nextToActiveCue.text}`,
      endTime: nextToActiveCue.endTime,
    });
    this.subtitles.delete(nextToActiveCue.uuid);

    this.historyManager.push(
      new MergeDownCueAction(activeCue, nextToActiveCue, this.subtitles),
    );

    this.app.invalidateQuery(QueryKey.CuesList);
    this.alterCueSelection(activeCue.uuid, { ctrlKey: false, shiftKey: false });
  }

  public setSplitCue(uuid: ISplitCueData | null) {
    this.subtitles.setSplitCueData(uuid);
    this.app.invalidateQuery(QueryKey.SplitCue);
  }

  public alterCueSelection(
    cue: IVTTCue["uuid"] | null,
    modifiers: {
      shiftKey: boolean;
      ctrlKey: boolean;
      key?: "ArrowUp" | "ArrowDown";
    },
  ) {
    const currentSelection = this.subtitles.getActiveCueArray();
    this.subtitles.alterCueSelection(cue, modifiers);
    const nextSelection = this.subtitles.getActiveCueArray();

    if (!areEqual(currentSelection, nextSelection)) {
      this.app.invalidateQuery(QueryKey.ActiveCue);
    }
  }

  public reoderCue(index: number, overIndex: number) {
    this.subtitles.reoderCue(index, overIndex);

    this.historyManager.push(
      new ReorderCueAction(index, overIndex, {
        reorder: (...args) => this.subtitles.reoderCue(...args),
      }),
    );

    this.app.window.updateMenu();
    this.app.invalidateQuery(QueryKey.CuesList);
  }
}
