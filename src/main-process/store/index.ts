import { EventEmitter } from "node:events";
import { IVideoStoreState, VideoStore } from "./video";
import { SubtitlesStore, ISubtitlesStoreState } from "./subtitles";
import { IVTTCue } from "shared/libs/vtt/vttcue";
import { IVTTRegion } from "shared/libs/vtt/vttregion";
import { AdjustDirection, AdjustSide, IAdjustTimePayload } from "shared/ipc";
import { assert } from "shared/assert";

export interface IApplicationState {
  video: IVideoStoreState;
  subtitles: ISubtitlesStoreState;
}

export class ApplicationStore extends EventEmitter<{
  "state-changed": [IApplicationState];
}> {
  protected video = new VideoStore();
  protected subtitles = new SubtitlesStore();

  public getState(): IApplicationState {
    return {
      video: this.video.getState(),
      subtitles: this.subtitles.getState(),
    };
  }

  public emitUpdate() {
    this.emit("state-changed", this.getState());
  }

  public setVideoPath(value: string | null) {
    this.video.setPath(value);
    this.emitUpdate();
  }

  public setFileAndCues(payload: {
    cues: IVTTCue[];
    regions: Record<string, IVTTRegion>;
    file: string | null;
  }) {
    this.subtitles.setCues(payload.cues);
    this.subtitles.setRegions(payload.regions);
    this.subtitles.setFile(payload.file);
    this.emitUpdate();
  }

  public insertCue(cue: IVTTCue) {
    this.subtitles.insertCue(cue);
    this.emitUpdate();
  }

  public patchCues(cues: IVTTCue[]) {
    this.subtitles.patchCues(cues);
    this.emitUpdate();
  }

  public setVideoDuration(value: number | null) {
    this.video.setDuration(value);
    console.log("Video duration set. No update emmited");
  }

  public deleteCues(uuids: IVTTCue["uuid"][]) {
    this.subtitles.deleteCues(uuids);
    this.emitUpdate();
  }
}
