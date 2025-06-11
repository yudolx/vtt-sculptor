import { createWindowMain } from "window-main/browser-window";
import { createCuePreferencesWindow } from "window-cue-preferences/browser-window";
import { IVTTCue } from "shared/libs/vtt/vttcue";
import { BrowserWindow } from "electron";
import { createSettingsWindow } from "window-settings/browser-window";
import { BackgroundProcess } from "./background-process";

export class WindowManager {
  public main: BrowserWindow;
  public cuePreferences = new Map<IVTTCue["uuid"], BrowserWindow>();
  public settings: BrowserWindow;

  constructor(protected app: BackgroundProcess) {
    this.main = createWindowMain({
      x: this.app.settings.windowsState.main.x,
      y: this.app.settings.windowsState.main.y,
      height: this.app.settings.windowsState.main.height,
      width: this.app.settings.windowsState.main.width,
    });

    this.settings = createSettingsWindow({
      x: this.app.settings.windowsState.settings.x,
      y: this.app.settings.windowsState.settings.y,
      height: this.app.settings.windowsState.settings.height,
      width: this.app.settings.windowsState.settings.width,
      parent: this.main,
    });

    this.app.settings.manageWindow("main", this.main);
    this.app.settings.manageWindow("settings", this.settings);
  }

  get permanentWindows() {
    /* eslint-disable-next-line @typescript-eslint/no-this-alias */
    const self = this;
    return {
      *[Symbol.iterator]() {
        yield ["main", self.main] as const;
        yield ["settings", self.settings] as const;
      },
    };
  }

  *[Symbol.iterator]() {
    yield this.main;

    for (const win of this.cuePreferences.values()) {
      yield win;
    }

    yield this.settings;
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
