import { pathToFileURL } from "node:url";

export class VideoStore {
  protected path: string | null = null;
  protected safePath: string | null = null;
  protected duration: number | null = null;
  protected subtitlesVisible = true;

  getSafePath() {
    return this.safePath;
  }

  getPath() {
    return this.path;
  }

  setPath(value: string | null) {
    this.path = value;

    if (value) {
      this.safePath = pathToFileURL(value).href;
    } else {
      this.safePath = null;
    }
  }

  getDuration() {
    return this.duration;
  }

  setDuration(value: number | null) {
    this.duration = value;
  }

  getSubtitlesVisible() {
    return this.subtitlesVisible;
  }

  setSubtitlesVisible(value: boolean) {
    this.subtitlesVisible = value;
  }
}
