import { ipcRenderer, IpcRendererEvent } from "electron";
import type { IApplicationState } from "main-process/store";
import { IVTTCue } from "./libs/vtt/vttcue";
import {
  IPCMainEvent,
  IPCRendererEvent,
  PRELOAD_GLOBAL_KEY,
} from "./constants";

export const EmitIPCEvent = Object.freeze({
  onStateChanged: (
    callback: (event: IpcRendererEvent, state: IApplicationState) => void,
  ) => {
    ipcRenderer.on(IPCMainEvent.StateChanged, callback);

    return () => {
      ipcRenderer.off(IPCMainEvent.StateChanged, callback);
    };
  },

  getState: (): Promise<IApplicationState> => {
    return ipcRenderer.invoke(IPCRendererEvent.GetState);
  },

  cueChanged: (cues: IVTTCue[]) => {
    ipcRenderer.send(IPCRendererEvent.CuesChanged, cues);
  },

  onRequestVideoCurrenTime: (callback: (event: IpcRendererEvent) => void) => {
    ipcRenderer.on(IPCMainEvent.RequestVideoCurentTime, callback);

    return () => {
      ipcRenderer.off(IPCMainEvent.RequestVideoCurentTime, callback);
    };
  },

  videoCurrentTime: (currentTime: number) => {
    ipcRenderer.send(IPCRendererEvent.VideoCurrentTime, currentTime);
  },
});

declare global {
  interface Window {
    [PRELOAD_GLOBAL_KEY]: typeof EmitIPCEvent;
  }
}
