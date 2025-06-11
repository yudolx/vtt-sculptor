import { createWindowMain } from "window-main/browser-window";
import { createCuePreferencesWindow } from "window-cue-preferences/browser-window";
import { IVTTCue } from "shared/libs/vtt/vttcue";
import { BrowserWindow } from "electron";

export class WindowManager {
  public main = createWindowMain();
  public cuePreferences = new Map<IVTTCue["uuid"], BrowserWindow>();

  *[Symbol.iterator]() {
    yield this.main;

    for (const win of this.cuePreferences.values()) {
      yield win;
    }
  }

  openCuePreferencesWindow(uuid: IVTTCue["uuid"]) {
    if (this.cuePreferences.has(uuid)) {
      const win = this.cuePreferences.get(uuid)!;
      win.flashFrame(true);
      if (win.isMinimized()) {
        win.restore();
      }
      win.once("focus", () => win.flashFrame(false));
    } else {
      const win = createCuePreferencesWindow({
        parent: this.main,
        frame: true,
      });

      win.setMenu(null);

      win.on("closed", () => {
        this.cuePreferences.delete(uuid);
      });

      win.show();

      this.cuePreferences.set(uuid, win);
    }
  }

  getPreferenceWindowFromWebContents(webContents: Electron.WebContents) {
    for (const [uuid, win] of this.cuePreferences.entries()) {
      if (win.webContents === webContents) {
        return [uuid, win] as const;
      }
    }

    return null;
  }

  getPreferenceWindow(uuid: IVTTCue["uuid"]) {
    return this.cuePreferences.get(uuid) ?? null;
  }
}
