import { ipcRenderer, IpcRendererEvent } from "electron";
import { PRELOAD_GLOBAL_KEY, QueryKey } from "./constants";
import { IS_DARWIN, IS_LINUX, IS_WIN32 } from "../main-process/constants";
import type { IVTTCue } from "./libs/vtt/vttcue";
import { IMinimalPartialVTTCue } from "main-process/store/subtitles";
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

  onRequestInsertNewCue: (
    callback: (event: IpcRendererEvent, timestamp: number) => void,
  ) => {
    ipcRenderer.on("ipc/main/request-insert-new-cue", callback);

    return () => {
      ipcRenderer.off("ipc/main/request-insert-new-cue", callback);
    };
  },

  fetchVideoPath: (): Promise<string> =>
    ipcRenderer.invoke("ipc/renderer/get-video-path"),

  fetchVideoTrackVisible: (): Promise<boolean> =>
    ipcRenderer.invoke("ipc/renderer/video-subtitles-visible"),

  setVideoTrackVisible: (value: boolean) => {
    ipcRenderer.send("ipc/renderer/set-video-subtitles-visible", value);
  },

  fetchCues: (): Promise<IVTTCue[]> =>
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

  patchCues: (cues: IMinimalPartialVTTCue[]) => {
    ipcRenderer.send("ipc/renderer/patch-cues", cues);
  },

  insertCues: (cues: IVTTCue) => {
    ipcRenderer.send("ipc/renderer/insert-cues", cues);
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

  reorderCue: (index: number, overIndex: number) => {
    ipcRenderer.send("ipc/renderer/reorder-cue", index, overIndex);
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
