import { EventEmitter } from "node:events";
import { IVideoStoreState, VideoStore } from "./video";
import { ISubtitlesStoreState, SubtitlesStore } from "./subtitles";

export interface IApplicationState {
  video: IVideoStoreState;
  subtitles: ISubtitlesStoreState;
}

export class ApplicationStore {
  private updateEmitter = new EventEmitter<{
    "did-update": [Partial<IApplicationState>];
  }>();

  public video = new VideoStore(this.updateEmitter);
  public subtitles = new SubtitlesStore(this.updateEmitter);

  subscribe(cb: (changedState: Partial<IApplicationState>) => void) {
    this.updateEmitter.on("did-update", cb);

    return () => {
      this.updateEmitter.off("did-update", cb);
    };
  }

  public getState(): IApplicationState {
    return {
      video: this.video.getState(),
      subtitles: this.subtitles.getState(),
    };
  }

  public setVideoPath = (videoPath: string | null) => {
    this.video.setVideoPath(videoPath);
  };

  public setFileAndCues = (payload: {
    cues: ISubtitlesStoreState["cues"];
    regions: ISubtitlesStoreState["regions"];
    file: ISubtitlesStoreState["file"];
  }) => {
    this.subtitles.setFileAndCues(payload);
  };
}
