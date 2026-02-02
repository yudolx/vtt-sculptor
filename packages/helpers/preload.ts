import {
  ipcRenderer,
  IpcRendererEvent,
  MessageBoxOptions,
  MessageBoxReturnValue,
  OpenDialogOptions,
  OpenDialogReturnValue,
} from "electron";
import { QueryKey } from "@sculptor/helpers/constants";
import { IVTTCue } from "@sculptor/helpers/vtt";
import {
  IS_DARWIN,
  IS_LINUX,
  IS_WIN32,
} from "@sculptor/main-process/constants";
import type { IMinimalPartialVTTCue } from "@sculptor/main-process/store/subtitles";
import type { ISettings } from "@sculptor/main-process/settings/types";
import type { IPluginIPCData } from "@sculptor/main-process/plugins-manager";
import { DeepPartial } from "./typeUtils";

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

  showOpenDialog: (
    options: OpenDialogOptions,
  ): Promise<OpenDialogReturnValue> =>
    ipcRenderer.invoke("ipc/showOpenDialog", options),

  showMessageBox: (
    options: MessageBoxOptions,
  ): Promise<MessageBoxReturnValue> =>
    ipcRenderer.invoke("ipc/showMessageBox", options),

  showErrorBox: (title: string, content: string) => {
    ipcRenderer.send("ipc/showErrorBox", title, content);
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

  merdeDown: () => {
    ipcRenderer.send("ipc/renderer/merge-down");
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

  setSettings: (settings: DeepPartial<ISettings>) =>
    ipcRenderer.invoke("ipc/renderer/set-settings", settings),

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

  // -----------------------------------------------------------------

  fetchPluginsList: (): Promise<IPluginIPCData[]> =>
    ipcRenderer.invoke("ipc/plugins/list"),

  invokePlugin: (
    pluginId: string,
    method: string,
    ...methodParameters: any[]
  ) => ipcRenderer.invoke(`plugins/${pluginId}/${method}`, ...methodParameters),

  sendPlugin: (pluginId: string, method: string, ...methodParameters: any[]) =>
    ipcRenderer.send(`plugins/${pluginId}/${method}`, ...methodParameters),
});
