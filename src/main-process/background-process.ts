import { ipcMain } from "electron";
import { AppMenu } from "./appmenu";
import { ApplicationStore } from "./store";
import type { IVTTCue } from "shared/libs/vtt/vttcue";
import { QueryKey } from "shared/constants";
import { WindowManager } from "./window-manager";

export class BackgroundProcess {
  public store = new ApplicationStore(this);
  public appMenu = new AppMenu(this);
  public window = new WindowManager();

  constructor() {
    this.bindActionEvents();
    this.window.main.show();
  }

  invalidateQuery = (query: QueryKey) => {
    for (const win of this.window) {
      if (win.isVisible()) {
        win.webContents.send("ipc/main/invalidate-query", query);
      }
    }
  };

  private bindActionEvents = () => {
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

    ipcMain
      .on("ipc/renderer/set-active-cue", (event, cue: IVTTCue["uuid"]) => {
        this.store.setActiveCue(cue);
      })
      .on("ipc/renderer/toggle-active-cue", (event, cue: IVTTCue["uuid"]) => {
        this.store.toggleActiveCue(cue);
      })
      .on("ipc/renderer/delete-cues", (event, cues: IVTTCue["uuid"][]) => {
        this.store.deleteCues(cues);
        this.appMenu.update();
      })
      .on("ipc/renderer/patch-cues", (event, cues: IVTTCue[]) => {
        this.store.patchCues(cues);
        this.appMenu.update();
      })
      .on("ipc/renderer/disable-hotkeys", () => {
        this.appMenu.setShortcutsActive(false);
      })
      .on("ipc/renderer/enable-hotkeys", () => {
        this.appMenu.setShortcutsActive(true);
      })
      .on("ipc/renderer/cue-context-menu", (event, uuid: IVTTCue["uuid"]) => {
        this.window.openCuePreferencesWindow(uuid);
      });
  };
}
