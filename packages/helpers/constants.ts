export const PRELOAD_GLOBAL_KEY = "electronAPI" as const;
export const DEFAULT_CUE_ADJUST_TIME = 0.1;
export const DEFAULT_CUE_LENGTH_SEC = 3;

export enum QueryKey {
  VideoPath = "VIDEO_PATH",
  CuesList = "CUES_LIST",
  RegionsList = "REGIONS_LIST",
  ActiveCue = "ACTIVE_CUE",
  PreferenceWindowCue = "PREFERENCE_WINDOW_CUE",
  Styles = "STYLES",
  Settings = "SETTINGS",
  SplitCue = "SPLIT_CUE",
  VideoSubtitlesVisible = "VIDEO_SUBTITLES_VISIBLE",
  PluginsList = "PLUGINS_LIST",
}
