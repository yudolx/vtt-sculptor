import { VideoStore } from "./video";
import { IPatchCuePayload, SubtitlesStore } from "./subtitles";
import { IVTTCue } from "shared/libs/vtt/vttcue";
import { IVTTRegion } from "shared/libs/vtt/vttregion";
import { QueryKey } from "shared/constants";
import type { BackgroundProcess } from "main-process/background-process";
import { IPlaceholderCue } from "./subtitles/placeholderCue";

export class ApplicationStore {
  public video = new VideoStore();
  public subtitles = new SubtitlesStore();

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

    this.app.invalidateQuery(QueryKey.VideoPath);
    this.app.invalidateQuery(QueryKey.CuesList);
    this.app.invalidateQuery(QueryKey.RegionsList);
    this.app.invalidateQuery(QueryKey.Styles);
  }

  public insertCue(cue: IVTTCue | IPlaceholderCue) {
    this.subtitles.patchOrInsertCues([cue]);
    this.app.invalidateQuery(QueryKey.CuesList);
  }

  public patchCues(cues: (IPatchCuePayload | IPlaceholderCue)[]) {
    this.subtitles.patchOrInsertCues(cues);
    this.app.invalidateQuery(QueryKey.CuesList);
    this.app.invalidateQuery(QueryKey.ActiveCue);
  }

  public setVideoDuration(value: number | null) {
    this.video.setDuration(value);
    console.log("Video duration set. No update emmited");
  }

  public deleteCues(uuids: IVTTCue["uuid"][]) {
    this.subtitles.deleteCues(uuids);
    this.app.invalidateQuery(QueryKey.CuesList);
    this.app.invalidateQuery(QueryKey.ActiveCue);
  }

  public setActiveCue(uuid: IVTTCue["uuid"][]) {
    this.subtitles.setActiveCue(uuid);
    this.app.invalidateQuery(QueryKey.ActiveCue);
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

  public toggleActiveCue(uuid: IVTTCue["uuid"]) {
    this.subtitles.toggleActiveCue(uuid);
    this.app.invalidateQuery(QueryKey.ActiveCue);
  }
}
