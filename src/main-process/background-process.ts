import { BrowserWindow, ipcMain, app as electronApp } from "electron";
import { ApplicationStore } from "./store";
import { IVTTCue } from "shared/libs/vtt/vttcue";
import { QueryKey } from "shared/constants";
import { WindowManager } from "./window-manager";
import { MenuManager } from "./menu";
import { IPatchCuePayload } from "./store/subtitles";
import { FileOpener } from "./file-opener";
import { SettingsStore } from "./settings";
import { ISettings } from "./settings/types";

export class BackgroundProcess {
  public settings = new SettingsStore();
  public fileOpener = new FileOpener(this);
  public store = new ApplicationStore(this);
  public menuManager = new MenuManager(this);
  public window = new WindowManager(this);

  constructor() {
    this.bindIpcEvents();

    electronApp.on("open-file", this.fileOpener.open);

    this.window.main.show();
  }

  invalidateQuery = (query: QueryKey, windowArg?: BrowserWindow) => {
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
    ipcMain.handle("ipc/renderer/get-video-path", () =>
      this.store.video.getPath(),
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
    ipcMain.handle("ipc/renderer/fetch-split-cue", () =>
      this.store.subtitles.getSplittingCue(),
    );

    ipcMain
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
        (event, payload: { uuid: IVTTCue["uuid"]; over: IVTTCue["uuid"] }) => {
          this.store.reoderCue(payload);
        },
      )
      .on("ipc/renderer/delete-cues", (event, cues: IVTTCue["uuid"][]) => {
        this.store.deleteCues(cues);
        this.menuManager.update();
      })
      .on("ipc/renderer/patch-cues", (event, cues: IPatchCuePayload[]) => {
        this.store.patchCues(cues);
        this.menuManager.update();
      })
      .on("ipc/renderer/disable-hotkeys", () => {
        this.menuManager.setGlobalShortcutsActive(false);
      })
      .on("ipc/renderer/enable-hotkeys", () => {
        this.menuManager.setGlobalShortcutsActive(true);
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
      .on(
        "ipc/settings/renderer/set-external-ids",
        (event, ids: ISettings["externalCueIds"]) => {
          this.settings.externalCueIds = ids;
          this.invalidateQuery(QueryKey.Settings);
        },
      )
      // -----------------------------------------------------------------
      .on(
        "ipc/renderer/cue-split",
        (event, cueId: IVTTCue["uuid"] | null, windowOpen: boolean) => {
          this.store.setSplitCue(cueId);

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
}
