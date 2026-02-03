import {
  BrowserWindow,
  ipcMain,
  app as electronApp,
  protocol,
  dialog,
  OpenDialogOptions,
  MessageBoxOptions,
} from "electron";
import fs from "fs/promises";
import path from "path";
import { ApplicationStore } from "./store";
import { QueryKey } from "@sculptor/helpers/constants";
import type { IVTTCue } from "@sculptor/helpers/vtt";
import { WindowManager } from "./window-manager";
import {
  IMinimalPartialVTTCue,
  ISplitCueData,
  ISplitCueIpcData,
} from "./store/subtitles";
import { FileOpener } from "./file-opener";
import { SettingsStore } from "./settings";
import { ISettings } from "./settings/types";
import { PluginsManager } from "./plugins-manager";
import { DeepPartial } from "@sculptor/helpers/typeUtils";

export class BackgroundProcess {
  public settings = new SettingsStore();
  public fileOpener = new FileOpener(this);
  public store = new ApplicationStore(this);
  public window = new WindowManager(this);
  public pluginManager = new PluginsManager(this);

  constructor() {
    this.bindIpcEvents();
    this.setupCustomProtocols();

    electronApp.on("open-file", this.fileOpener.open);

    this.window.main.show();
  }

  invalidateQuery = (
    query: QueryKey | (string & {}),
    windowArg?: BrowserWindow,
  ) => {
    if (windowArg) {
      windowArg.webContents.send("ipc/main/invalidate-query", query);
    } else {
      for (const win of this.window) {
        if (win.isVisible()) {
          win.webContents.send("ipc/main/invalidate-query", query);
        }
      }
    }
  };

  private bindIpcEvents = () => {
    ipcMain.handle(
      "ipc/showOpenDialog",
      async (event, options: OpenDialogOptions) => {
        return await dialog.showOpenDialog(
          BrowserWindow.fromWebContents(event.sender)!,
          options,
        );
      },
    );
    ipcMain.handle(
      "ipc/showMessageBox",
      async (event, options: MessageBoxOptions) => {
        return await dialog.showMessageBox(
          BrowserWindow.fromWebContents(event.sender)!,
          options,
        );
      },
    );

    ipcMain.handle("ipc/renderer/get-video-path", () =>
      this.store.video.getSafePath(),
    );
    ipcMain.handle("ipc/renderer/get-cues", () =>
      this.store.subtitles.getCues(),
    );
    ipcMain.handle("ipc/renderer/get-regions", () =>
      this.store.subtitles.getRegions(),
    );
    ipcMain.handle("ipc/renderer/get-active-cues-uuid", () =>
      this.store.subtitles.getActiveCueArray(),
    );
    ipcMain.handle("ipc/renderer/get-active-cues", () => {
      return this.store.subtitles.getActiveCues();
    });
    ipcMain.handle("ipc/renderer/get-styles", () =>
      this.store.subtitles.getStyles(),
    );
    ipcMain.handle("ipc/renderer/get-settings", () => this.settings.getState());
    ipcMain.handle(
      "ipc/renderer/set-settings",
      (event, settings: DeepPartial<ISettings>) => {
        this.settings.setState(settings);
        this.invalidateQuery(QueryKey.Settings);
      },
    );

    ipcMain.handle("ipc/renderer/fetch-split-cue", () =>
      this.store.subtitles.getSplitCueData(),
    );
    ipcMain.handle("ipc/renderer/video-subtitles-visible", () =>
      this.store.video.getSubtitlesVisible(),
    );
    ipcMain.handle("ipc/plugins/list", () => this.pluginManager.ipcList());

    ipcMain
      .on("ipc/showErrorBox", (e, title: string, content: string) => {
        dialog.showErrorBox(title, content);
      })
      .on(
        "ipc/renderer/set-video-subtitles-visible",
        (event, value: boolean) => {
          this.store.setVideoSubtitlesVisible(value);
        },
      )
      .on(
        "ipc/renderer/alter-selection",
        (
          event,
          cue: IVTTCue["uuid"] | null,
          modifiers: {
            shiftKey: boolean;
            ctrlKey: boolean;
            key?: "ArrowUp" | "ArrowDown";
          },
        ) => {
          this.store.alterCueSelection(cue, modifiers);
        },
      )
      .on(
        "ipc/renderer/reorder-cue",
        (event, index: number, overIndex: number) => {
          this.store.reoderCue(index, overIndex);
        },
      )
      .on("ipc/renderer/delete-cues", (event, cues: IVTTCue["uuid"][]) => {
        this.store.deleteCues(cues);
      })
      .on("ipc/renderer/insert-cues", (event, cue: IVTTCue) => {
        this.store.insertCue(cue);
      })
      .on("ipc/renderer/patch-cues", (event, cues: IMinimalPartialVTTCue[]) => {
        this.store.patchCues(cues);
      })
      .on("ipc/renderer/merge-down", () => {
        this.store.mergeDownCue();
      })
      .on("ipc/renderer/disable-hotkeys", () => {
        this.window.setGlobalShortcutsActive(false);
      })
      .on("ipc/renderer/enable-hotkeys", () => {
        this.window.setGlobalShortcutsActive(true);
      })
      .on(
        "ipc/renderer/cue-context-menu",
        (event, uuidArg: IVTTCue["uuid"]) => {
          const currentActiveCues = this.store.subtitles.getActiveCueArray();
          if (!currentActiveCues.includes(uuidArg)) {
            this.store.alterCueSelection(uuidArg, {
              ctrlKey: false,
              shiftKey: false,
            });
          }
          this.window.openCuePreferencesWindow();
        },
      )
      // -----------------------------------------------------------------

      .on("ipc/preference/renderer/close-window", () => {
        this.window.cuePreferences?.close();
      })
      // -----------------------------------------------------------------
      .on(
        "ipc/renderer/cue-split",
        (event, cueData: ISplitCueData, windowOpen: boolean) => {
          this.store.setSplitCue(cueData);

          if (windowOpen) {
            this.window.openCueSplitWindow();
          } else {
            this.window.cueSplit?.close();
          }
        },
      )
      .on(
        "ipc/preference/renderer/submit-split-cue",
        (event, originalCueId: IVTTCue["uuid"], replaceWith: IVTTCue[]) => {
          this.store.setSplitCue(null);
          this.window.cueSplit?.close();
          this.store.replaceCue(originalCueId, replaceWith);
        },
      );
  };

  requestInsertNewCue = () => {
    const time = Date.now();
    this.window.main.webContents.send("ipc/main/request-insert-new-cue", time);
  };

  setupCustomProtocols = () => {
    protocol.handle("plugins", async (request) => {
      console.log(request.url);
      await this.pluginManager.ready;

      const requestPath = request.url.slice("plugins://".length);

      const [, pluginId, method] =
        requestPath.match(/^([a-z_\d]+)\/(.+)$/i) ?? [];

      if (typeof pluginId === "string" && typeof method === "string") {
        if (pluginId === "host") {
          const methodParts = method.split("/");
          if (
            methodParts.at(0) === "file" &&
            (methodParts.at(1)?.length ?? 0) > 0
          ) {
            const content = await fs.readFile(
              path.join(__dirname, methodParts.at(1)!),
              "utf-8",
            );
            return new Response(content, { status: 200 });
          }
        } else {
          return this.pluginManager.execute(pluginId, method);
        }
      }

      return new Response("Not found", {
        status: 400,
      });
    });
  };
}
