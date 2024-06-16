import { createAction } from "@reduxjs/toolkit";
import { IVTTCue } from "./libs/vtt/vttcue";
import { IApplicationState } from "main-process/store";

export const PRELOAD_GLOBAL_KEY = "electronAPI" as const;

export const IPCMainEvent = Object.freeze({
  StateChanged: createAction<IApplicationState>("ipc/main/state-changed"),
  RequestVideoCurentTime: createAction("ipc/main/request-video-current-time"),
});

export const IPCRendererEvent = Object.freeze({
  GetState: createAction("ipc/renderer/get-state"),
  CuesChanged: createAction<IVTTCue[]>("ipc/renderer/cues-changed"),
  VideoCurrentTime: createAction<number>("ipc/renderer/video-current-time"),
});
