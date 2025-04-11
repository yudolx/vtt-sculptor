export const PRELOAD_GLOBAL_KEY = "electronAPI" as const;
export const DEFAULT_CUE_ADJUST_TIME = 0.1;
export const DEFAULT_CUE_LENGTH_SEC = 3;

export enum QueryKey {
  VideoPath,
  CuesList,
  RegionsList,
  ActiveCue,
  PreferenceWindowCue,
}
