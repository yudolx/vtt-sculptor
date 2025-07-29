import { VideoStore } from "./video";
import { IMinimalPartialVTTCue, SubtitlesStore } from "./subtitles";
import { IVTTCue } from "shared/libs/vtt/vttcue";
import { IVTTRegion } from "shared/libs/vtt/vttregion";
import { QueryKey } from "shared/constants";
import type { BackgroundProcess } from "main-process/background-process";
import { HistoryManager } from "main-process/history";
import { AddCueAction } from "main-process/history/actions/add-cue";
import { CuePatchAction } from "main-process/history/actions/cue-patch";
import { assert } from "shared/assert";
import { deepClone } from "shared/deepClone";
import { DeleteCueAction } from "main-process/history/actions/delete-cue";
import { ReorderCueAction } from "main-process/history/actions/reorder-cue";

export class ApplicationStore {
  public video = new VideoStore();
  public subtitles = new SubtitlesStore();
  public historyManager = new HistoryManager();

  constructor(protected app: BackgroundProcess) {}

  public setVideoPath(value: string | null) {
    this.video.setPath(value);
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

    this.app.menuManager.update();
    this.app.invalidateQuery(QueryKey.CuesList);
    this.app.invalidateQuery(QueryKey.ActiveCue);
  }

  public patchCues(cues: IMinimalPartialVTTCue[]) {
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

    this.app.menuManager.update();
    this.app.invalidateQuery(QueryKey.CuesList);
    this.app.invalidateQuery(QueryKey.ActiveCue);
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
        new AddCueAction(replaceCue, index, {
          deleteCue: (...args) => this.subtitles.delete(...args),
          insertCue: (...args) => this.subtitles.insert(...args),
        }),
      );

      index += 1;
    }

    this.app.menuManager.update();
    this.app.invalidateQuery(QueryKey.CuesList);
    this.app.invalidateQuery(QueryKey.ActiveCue);
  }

  public deleteCues(uuids: IVTTCue["uuid"][]) {
    let latestCueIndex: number = -1;
    const cues = this.subtitles.getCues();

    for (const uuid of uuids) {
      const cue = cues.find((c) => c.uuid === uuid);
      const index = this.subtitles.delete(uuid);

      assert(cue, "[deleteCues] No cue found");

      this.historyManager.push(
        new DeleteCueAction(cue, index, {
          deleteCue: (...args) => this.subtitles.delete(...args),
          insertCue: (...args) => this.subtitles.insert(...args),
        }),
      );

      latestCueIndex = Math.max(latestCueIndex, index);
    }

    const latestAvailableCueIndex = Math.min(latestCueIndex, cues.length - 1);
    const latestAvailableCue = cues.at(latestAvailableCueIndex)!;

    this.subtitles.updateItemsForSelectionModel([latestAvailableCue.uuid]);

    this.app.menuManager.update();
    this.app.invalidateQuery(QueryKey.CuesList);
    this.app.invalidateQuery(QueryKey.ActiveCue);
  }

  public setSplitCue(uuid: IVTTCue["uuid"] | null) {
    this.subtitles.setSplittingCue(uuid);
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
    this.subtitles.alterCueSelection(cue, modifiers);
    this.app.invalidateQuery(QueryKey.ActiveCue);
  }

  public reoderCue(index: number, overIndex: number) {
    this.subtitles.reoderCue(index, overIndex);

    this.historyManager.push(
      new ReorderCueAction(index, overIndex, {
        reorder: (...args) => this.subtitles.reoderCue(...args),
      }),
    );

    this.app.menuManager.update();
    this.app.invalidateQuery(QueryKey.CuesList);
  }

  public undo() {
    this.historyManager.undo();
  }

  public redo() {
    this.historyManager.redo();
  }
}
