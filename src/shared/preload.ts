import { ipcRenderer, IpcRendererEvent } from "electron";
import type { IApplicationState } from "main-process/store";
import { PRELOAD_GLOBAL_KEY, QueryKey } from "./constants";
import type { IVTTCue } from "./libs/vtt/vttcue";
import type { IPlaceholderCue } from "main-process/store/subtitles/placeholderCue";

export const EmitIPCEvent = Object.freeze({
  onInvalidateQuery: (
    callback: (event: IpcRendererEvent, query: QueryKey) => void,
  ) => {
    ipcRenderer.on("ipc/main/invalidate-query", callback);

    return () => {
      ipcRenderer.off("ipc/main/invalidate-query", callback);
    };
  },

  fetchVideoPath: (): Promise<string> =>
    ipcRenderer.invoke("ipc/renderer/get-video-path"),

  fetchCues: (): Promise<(IVTTCue | IPlaceholderCue)[]> =>
    ipcRenderer.invoke("ipc/renderer/get-cues"),

  fetchRegions: (): Promise<Record<string, VTTRegion>> =>
    ipcRenderer.invoke("ipc/renderer/get-regions"),

  deleteCues: (cues: IVTTCue["uuid"][]) =>
    ipcRenderer.send("ipc/renderer/delete-cues", cues),

  cueChanged: (cues: IVTTCue[]) => {
    ipcRenderer.send("ipc/renderer/cues-changed", cues);
  },

  disableHotkeys: () => {
    ipcRenderer.send("ipc/renderer/disable-hotkeys");
  },

  enableHotkeys: () => {
    ipcRenderer.send("ipc/renderer/enable-hotkeys");
  },

  // -----------------------------------------------------------------

  onStateChanged: (
    callback: (event: IpcRendererEvent, state: IApplicationState) => void,
  ) => {
    ipcRenderer.on("ipc/main/state-changed", callback);

    return () => {
      ipcRenderer.off("ipc/main/state-changed", callback);
    };
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

  // adjustTime: (cue: IVTTCue, side: AdjustSide, direction: AdjustDirection) => {
  //   ipcRenderer.send("ipc/renderer/adjust-time", { cue, side, direction });
  // },
});

declare global {
  interface Window {
    [PRELOAD_GLOBAL_KEY]: typeof EmitIPCEvent;
  }
}
