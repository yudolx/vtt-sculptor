import { BaseStore } from "../base";

export interface IVideoStoreState {
  path: string | null;
}

export class VideoStore extends BaseStore<IVideoStoreState> {
  private _path: string | null = null;

  get path() {
    return this._path;
  }

  public getState() {
    return { path: this.path };
  }

  public setVideoPath(videoPath: string | null) {
    this._path = videoPath;
    this.emitUpdate();
  }
}
