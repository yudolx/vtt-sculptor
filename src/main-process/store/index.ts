import { EventEmitter } from "node:events";
import { IVideoStoreState, VideoStore } from "./video";

export interface IApplicationState {
  video: IVideoStoreState;
}

export class ApplicationStore extends EventEmitter<{
  "state-changed": [IApplicationState];
}> {
  protected video = new VideoStore();

  public async getState(): Promise<IApplicationState> {
    return {
      video: await this.video.getState(),
    };
  }

  dispatch() {}
}
