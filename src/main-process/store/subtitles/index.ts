import { IVTTCue } from "shared/libs/vtt/vttcue";
import { IVTTRegion } from "shared/libs/vtt/vttregion";

import { BaseStore } from "../base";

export interface ISubtitlesStoreState {
  file: string | null;
  cues: IVTTCue[] | null;
  regions: Record<string, IVTTRegion> | null;
}

export class SubtitlesStore<K extends string> extends BaseStore<
  K,
  ISubtitlesStoreState
> {
  private _file: string | null = null;
  private _cues: IVTTCue[] | null = null;
  private _regions: Record<string, IVTTRegion> | null = null;

  get file() {
    return this._file;
  }

  get cues() {
    return this._cues;
  }

  get regions() {
    return this._regions;
  }

  public getState() {
    return {
      file: this.file,
      cues: this.cues,
      regions: this.regions,
    };
  }

  public setFileAndCues(payload: {
    cues: ISubtitlesStoreState["cues"];
    regions: ISubtitlesStoreState["regions"];
    file: ISubtitlesStoreState["file"];
  }) {
    this._cues = payload.cues;
    this._regions = payload.regions;
    this._file = payload.file;
    this.emitUpdate();
  }
}
