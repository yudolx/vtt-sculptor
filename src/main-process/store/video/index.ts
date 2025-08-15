import { pathToFileURL } from "node:url";

export class VideoStore {
  protected path: string | null = null;
  protected safePath: string | null = null;
  protected duration: number | null = null;

  setPath(value: string | null) {
    this.path = value;

    if (value) {
      this.safePath = pathToFileURL(value).href;
    } else {
      this.safePath = null;
    }
  }

  setDuration(value: number | null) {
    this.duration = value;
  }

  getPath() {
    return this.path;
  }

  getSafePath() {
    return this.safePath;
  }

  getDuration() {
    return this.duration;
  }
}
