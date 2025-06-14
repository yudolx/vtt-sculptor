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
    ipcMain.handle("ipc/renderer/get-active-cue", () =>
      this.store.subtitles.getActiveCueArray(),
    );
    ipcMain.handle("ipc/preference/renderer/fetch-cue", (event) => {
      const entrie = this.window.getPreferenceWindowFromWebContents(
        event.sender,
      );
      if (entrie) {
        const [uuid] = entrie;
        return this.store.subtitles.getCues(uuid);
      }
      return null;
    });
    ipcMain.handle("ipc/renderer/get-styles", () =>
      this.store.subtitles.getStyles(),
    );
    ipcMain.handle("ipc/renderer/get-settings", () => this.settings.getState());
    ipcMain.handle("ipc/renderer/fetch-split-cue", () =>
      this.store.subtitles.getSplittingCue(),
    );

    ipcMain
      .on("ipc/renderer/set-active-cue", (event, cue: IVTTCue["uuid"][]) => {
        this.store.setActiveCue(cue);
      })
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
      .on("ipc/renderer/toggle-active-cue", (event, cue: IVTTCue["uuid"]) => {
        this.store.toggleActiveCue(cue);
      })
      .on("ipc/renderer/delete-cues", (event, cues: IVTTCue["uuid"][]) => {
        this.store.deleteCues(cues);
        this.menuManager.update();
      })
      .on("ipc/renderer/patch-cues", (event, cues: IPatchCuePayload[]) => {
        this.store.patchCues(cues);
        this.menuManager.update();
        for (const cue of cues) {
          const win = this.window.getPreferenceWindow(cue.uuid);
          if (win) {
            this.invalidateQuery(QueryKey.PreferenceWindowCue, win);
          }
        }
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
          const cue = this.store.subtitles
            .getCues()
            .find((c) => c.uuid === uuidArg);

          if (cue) {
            this.window.openCuePreferencesWindow(cue.uuid);
          }
        },
      )
      // -----------------------------------------------------------------

      .on("ipc/preference/renderer/patch-cue", (event, cue: IVTTCue) => {
        const entrie = this.window.getPreferenceWindowFromWebContents(
          event.sender,
        );

        if (entrie) {
          const [uuid, win] = entrie;
          if (uuid === cue.uuid) {
            this.store.patchCues([cue]);
            this.invalidateQuery(QueryKey.PreferenceWindowCue, win);
          }
        }
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
          console.log(cueId, windowOpen);
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
