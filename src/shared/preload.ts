import { ipcRenderer, IpcRendererEvent } from "electron";
import type { IApplicationState } from "main-process/store";
import { IVTTCue } from "./libs/vtt/vttcue";
import {
  IPCMainEvent,
  IPCRendererEvent,
  PRELOAD_GLOBAL_KEY,
} from "./constants";
import { invokeFromRenderer, sendFromRenderer } from "./ipcrenderer";

export const EmitIPCEvent = Object.freeze({
  onStateChanged: (
    callback: (event: IpcRendererEvent, state: IApplicationState) => void,
  ) => {
    ipcRenderer.on(IPCMainEvent.StateChanged.type, callback);

    return () => {
      ipcRenderer.off(IPCMainEvent.StateChanged.type, callback);
    };
  },

  onRequestVideoCurrenTime: (callback: (event: IpcRendererEvent) => void) => {
    ipcRenderer.on(IPCMainEvent.RequestVideoCurentTime.type, callback);

    return () => {
      ipcRenderer.off(IPCMainEvent.RequestVideoCurentTime.type, callback);
    };
  },

  getState: (): Promise<IApplicationState> => {
    return invokeFromRenderer(IPCRendererEvent.GetState());
  },

  cueChanged: (cues: IVTTCue[]) => {
    sendFromRenderer(IPCRendererEvent.CuesChanged(cues));
  },

  videoCurrentTime: (currentTime: number) => {
    sendFromRenderer(IPCRendererEvent.VideoCurrentTime(currentTime));
  },
});

declare global {
  interface Window {
    [PRELOAD_GLOBAL_KEY]: typeof EmitIPCEvent;
  }
}
