import { ipcRenderer, IpcRendererEvent } from "electron";
import { PRELOAD_GLOBAL_KEY, QueryKey } from "./constants";
import { IS_DARWIN, IS_LINUX, IS_WIN32 } from "../main-process/constants";
import type { IVTTCue } from "./libs/vtt/vttcue";
import type { IPlaceholderCue } from "main-process/store/subtitles/placeholderCue";
import { IPatchCuePayload } from "main-process/store/subtitles";
import { ISettings } from "main-process/settings/types";

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

  fetchActiveCuesUuid: (): Promise<string[]> =>
    ipcRenderer.invoke("ipc/renderer/get-active-cues-uuid"),

  fetchActiveCues: (): Promise<IVTTCue[]> =>
    ipcRenderer.invoke("ipc/renderer/get-active-cues"),

  deleteCues: (cues: IVTTCue["uuid"][]) =>
    ipcRenderer.send("ipc/renderer/delete-cues", cues),

  patchCues: (cues: IPatchCuePayload[]) => {
    console.log(cues);
    ipcRenderer.send("ipc/renderer/patch-cues", cues);
  },

  alterSelection: (
    cue: IVTTCue["uuid"] | null,
    modifiers: {
      shiftKey: boolean;
      ctrlKey: boolean;
      key?: "ArrowUp" | "ArrowDown";
    },
  ) => {
    ipcRenderer.send("ipc/renderer/alter-selection", cue, modifiers);
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

  closePreferenceWindow: () => {
    ipcRenderer.send("ipc/preference/renderer/close-window");
  },

  // -----------------------------------------------------------------

  fetchSettings: (): Promise<ISettings> =>
    ipcRenderer.invoke("ipc/renderer/get-settings"),

  settingsSetExternalCueIds: (ids: ISettings["externalCueIds"]) =>
    ipcRenderer.send("ipc/settings/renderer/set-external-ids", ids),

  // -----------------------------------------------------------------

  splitCue: (cue: IVTTCue["uuid"] | null, windowOpen = true) =>
    ipcRenderer.send("ipc/renderer/cue-split", cue, windowOpen),

  fetchSplitCue: (): Promise<IVTTCue | null> =>
    ipcRenderer.invoke("ipc/renderer/fetch-split-cue"),

  submitSplitCue: (originalCueId: IVTTCue["uuid"], replaceWith: IVTTCue[]) =>
    ipcRenderer.send(
      "ipc/preference/renderer/submit-split-cue",
      originalCueId,
      replaceWith,
    ),
});

declare global {
  interface Window {
    [PRELOAD_GLOBAL_KEY]: typeof EmitIPCEvent;
  }
}
