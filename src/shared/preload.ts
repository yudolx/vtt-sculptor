import { ipcRenderer, IpcRendererEvent } from "electron";
import type { IApplicationState } from "main-process/store";

export const PRELOAD_GLOBAL_KEY = "electronAPI" as const;

export enum IPCMainEvent {
  StateChanged = "state-changed",
}

export enum IPCRendererEvent {
  GetState = "get-state",
}

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
});

declare global {
  interface Window {
    [PRELOAD_GLOBAL_KEY]: typeof EmitIPCEvent;
  }
}
