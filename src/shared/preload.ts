import { ipcRenderer, IpcRendererEvent } from "electron";
import { PRELOAD_GLOBAL_KEY, QueryKey } from "./constants";
import { IS_DARWIN, IS_LINUX, IS_WIN32 } from "../main-process/constants";
import type { IVTTCue } from "./libs/vtt/vttcue";
import type { IPlaceholderCue } from "main-process/store/subtitles/placeholderCue";

export const EmitIPCEvent = Object.freeze({
  IS_DARWIN,
  IS_LINUX,
  IS_WIN32,

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

  fetchStyles: (): Promise<string[]> =>
    ipcRenderer.invoke("ipc/renderer/get-styles"),

  fetchActiveCue: (): Promise<string[]> =>
    ipcRenderer.invoke("ipc/renderer/get-active-cue"),

  deleteCues: (cues: IVTTCue["uuid"][]) =>
    ipcRenderer.send("ipc/renderer/delete-cues", cues),

  patchCues: (cues: IVTTCue[]) => {
    ipcRenderer.send("ipc/renderer/patch-cues", cues);
  },

  setActiveCue: (
    cue: IVTTCue["uuid"],
    modifiers: { shiftKey: boolean; ctrlKey: boolean },
  ) => {
    ipcRenderer.send("ipc/renderer/set-active-cue", cue, modifiers);
  },

  toggleActiveCue: (cue: IVTTCue["uuid"]) => {
    ipcRenderer.send("ipc/renderer/toggle-active-cue", cue);
  },

  disableHotkeys: () => {
    ipcRenderer.send("ipc/renderer/disable-hotkeys");
  },

  enableHotkeys: () => {
    ipcRenderer.send("ipc/renderer/enable-hotkeys");
  },

  showCueContextMenu: (cue: IVTTCue["uuid"]) => {
    ipcRenderer.send("ipc/renderer/cue-context-menu", cue);
  },

  // -----------------------------------------------------------------

  preferenceWindowFetchCue: (): Promise<IVTTCue | null> =>
    ipcRenderer.invoke("ipc/preference/renderer/fetch-cue"),

  prefenceWindowPatchCue: (cue: IVTTCue) =>
    ipcRenderer.send("ipc/preference/renderer/patch-cue", cue),
});

declare global {
  interface Window {
    [PRELOAD_GLOBAL_KEY]: typeof EmitIPCEvent;
  }
}
