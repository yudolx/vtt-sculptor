export const PRELOAD_GLOBAL_KEY = "electronAPI" as const;
export const DEFAULT_CUE_ADJUST_TIME = 0.1;
export const DEFAULT_CUE_LENGTH_SEC = 3;

export const IS_DARWIN = process.platform === "darwin";
export const IS_WIN32 = process.platform === "win32";
export const IS_LINUX = process.platform === "linux";

export enum QueryKey {
  VideoPath,
  CuesList,
  RegionsList,
  ActiveCue,
}
