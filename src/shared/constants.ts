export const PRELOAD_GLOBAL_KEY = "electronAPI" as const;

export enum IPCMainEvent {
  StateChanged = "ipc/main/state-changed",
  RequestVideoCurentTime = "ipc/main/request-video-current-time",
}

export enum IPCRendererEvent {
  GetState = "ipc/renderer/get-state",
  CuesChanged = "ipc/renderer/cues-changed",
  VideoCurrentTime = "ipc/renderer/video-current-time",
}
