import { BaseStore } from "../base";

export interface IVideoStoreState {
  path: string | null;
}

export class VideoStore extends BaseStore<IVideoStoreState> {
  protected path: string | null = null;
  protected duration: number | null = null;

  public getState() {
    return { path: this.path, duration: this.duration };
  }

  setPath(value: string | null) {
    this.path = value;
  }

  setDuration(value: number | null) {
    this.duration = value;
  }

  getPath() {
    return this.path;
  }

  getDuration() {
    return this.duration;
  }
}
