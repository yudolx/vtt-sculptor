import type { IVTTCue } from "./libs/vtt/vttcue";

export enum AdjustSide {
  Start,
  End,
}

export enum AdjustDirection {
  Minus,
  Plus,
}

export interface IAdjustTimePayload {
  cue: IVTTCue["uuid"];
  side: AdjustSide;
  direction: AdjustDirection;
}
