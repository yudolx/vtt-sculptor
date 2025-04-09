import { IVideoStoreState, VideoStore } from "./video";
import { SubtitlesStore, ISubtitlesStoreState } from "./subtitles";
import { IVTTCue } from "shared/libs/vtt/vttcue";
import { IVTTRegion } from "shared/libs/vtt/vttregion";
import { QueryKey } from "shared/constants";
import type { BackgroundProcess } from "main-process/background-process";
import { IPlaceholderCue } from "./subtitles/placeholderCue";

export interface IApplicationState {
  video: IVideoStoreState;
  subtitles: ISubtitlesStoreState;
}

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
    file: string | null;
  }) {
    this.subtitles.setCues(payload.cues);
    this.subtitles.setRegions(payload.regions);
    this.subtitles.setFile(payload.file);

    this.app.invalidateQuery(QueryKey.VideoPath);
    this.app.invalidateQuery(QueryKey.CuesList);
    this.app.invalidateQuery(QueryKey.RegionsList);
  }

  public insertCue(cue: IVTTCue | IPlaceholderCue) {
    this.subtitles.testPatchOrInsertCues([cue]);
    this.app.invalidateQuery(QueryKey.CuesList);
  }

  public patchCues(cues: (IVTTCue | IPlaceholderCue)[]) {
    this.subtitles.testPatchOrInsertCues(cues);
    this.app.invalidateQuery(QueryKey.CuesList);
  }

  public setVideoDuration(value: number | null) {
    this.video.setDuration(value);
    console.log("Video duration set. No update emmited");
  }

  public deleteCues(uuids: IVTTCue["uuid"][]) {
    this.subtitles.deleteCues(uuids);
    this.app.invalidateQuery(QueryKey.CuesList);
  }
}
