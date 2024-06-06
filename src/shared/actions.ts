import { createAction } from "@reduxjs/toolkit";
import { IVTTCue } from "./libs/vtt/vttcue";
import { IVTTRegion } from "./libs/vtt/vttregion";
import type { BackgroundProcess } from "main-process/background-process";

export const backgroundProcessStarted = createAction<BackgroundProcess>(
  "core/backgroundProcessStarted",
);

export const setVideoPath = createAction<string>("video/setPath");

export const appMenuFileNew = createAction("appmenu/file:new");
export const appMenuFileOpen = createAction<{
  file: string;
  cues: (IVTTCue | IVTTRegion)[];
}>("appmenu/file:open");
