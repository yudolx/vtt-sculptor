import { ipcRenderer, IpcRendererEvent } from "electron";
import type { IApplicationState } from "main-process/store";
import { PRELOAD_GLOBAL_KEY } from "./constants";
import { IVTTCue } from "./libs/vtt/vttcue";

export const EmitIPCEvent = Object.freeze({
  onStateChanged: (
    callback: (
      event: IpcRendererEvent,
      state: Partial<IApplicationState>,
    ) => void,
  ) => {
    ipcRenderer.on("ipc/main/state-changed", callback);

    return () => {
      ipcRenderer.off("ipc/main/state-changed", callback);
    };
  },

  getState: () => ipcRenderer.invoke("ipc/renderer/get-state"),

  onRequestVideoCurrenTime: (callback: (event: IpcRendererEvent) => void) => {
    ipcRenderer.on("ipc/main/request-video-current-time", callback);

    return () => {
      ipcRenderer.off("ipc/main/request-video-current-time", callback);
    };
  },

  cueChanged: (cues: IVTTCue[]) => {
    ipcRenderer.send("ipc/renderer/cues-changed", cues);
  },

  videoCurrentTime: (currentTime: number) => {
    ipcRenderer.send("ipc/renderer/video-current-time", currentTime);
  },
});

declare global {
  interface Window {
    [PRELOAD_GLOBAL_KEY]: typeof EmitIPCEvent;
  }
}
