export class VideoStore {
  protected path: string | null = null;
  protected duration: number | null = null;

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
