import { ipcRenderer, IpcRendererEvent } from "electron";
import type { IApplicationState } from "main-process/store";
import { PRELOAD_GLOBAL_KEY } from "./constants";
import { IVTTCue } from "./libs/vtt/vttcue";

export const EmitIPCEvent = Object.freeze({
  onStateChanged: (
    callback: (event: IpcRendererEvent, state: IApplicationState) => void,
  ) => {
    ipcRenderer.on("ipc/main/state-changed", callback);

    return () => {
      ipcRenderer.off("ipc/main/state-changed", callback);
    };
  },

  disableHotkeys: () => {
    ipcRenderer.send("ipc/renderer/disable-hotkeys");
  },

  enableHotkeys: () => {
    ipcRenderer.send("ipc/renderer/enable-hotkeys");
  },

  getState: () => ipcRenderer.invoke("ipc/renderer/get-state"),

  onRequestVideoCurrentTime: (callback: () => number) => {
    const innerCallback = (event: IpcRendererEvent, data: { uuid: string }) => {
      const time = callback();

      ipcRenderer.send(
        `ipc/main/request-video-current-time-${data.uuid}`,
        time,
      );
    };

    ipcRenderer.on("ipc/main/request-video-current-time", innerCallback);

    return () => {
      ipcRenderer.off("ipc/main/request-video-current-time", innerCallback);
    };
  },

  videoDuration: (duration: number | null) => {
    ipcRenderer.send("ipc/renderer/video-duration", duration);
  },

  cueChanged: (cues: IVTTCue[]) => {
    ipcRenderer.send("ipc/renderer/cues-changed", cues);
  },

  deleteCues: (cues: IVTTCue["uuid"][]) => {
    ipcRenderer.send("ipc/renderer/delete-cues", cues);
  },

  // adjustTime: (cue: IVTTCue, side: AdjustSide, direction: AdjustDirection) => {
  //   ipcRenderer.send("ipc/renderer/adjust-time", { cue, side, direction });
  // },
});

declare global {
  interface Window {
    [PRELOAD_GLOBAL_KEY]: typeof EmitIPCEvent;
  }
}
