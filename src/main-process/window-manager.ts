import { createWindowMain } from "window-main/browser-window";
import { createCuePreferencesWindow } from "window-cue-preferences/browser-window";
import { IVTTCue } from "shared/libs/vtt/vttcue";
import { Menu } from "electron";
import { createSettingsWindow } from "window-settings/browser-window";
import { BackgroundProcess } from "./background-process";
import { createCueSplitWindow } from "window-cue-split/browser-window";
import { VTTSculptorBrowserWindow } from "shared/VttSculptorBrowserWindow";

export class WindowManager {
  public main: VTTSculptorBrowserWindow;
  public cuePreferences = new Map<IVTTCue["uuid"], VTTSculptorBrowserWindow>();
  public settings: VTTSculptorBrowserWindow | null = null;
  public cueSplit: VTTSculptorBrowserWindow | null = null;

  constructor(protected app: BackgroundProcess) {
    this.main = this.createMainWindow();
  }

  *[Symbol.iterator]() {
    yield this.main;

    for (const win of this.cuePreferences.values()) {
      yield win;
    }

    if (this.settings) {
      yield this.settings;
    }
  }

  protected createMainWindow() {
    const win = createWindowMain({
      x: this.app.settings.windowsState.main.x,
      y: this.app.settings.windowsState.main.y,
      height: this.app.settings.windowsState.main.height,
      width: this.app.settings.windowsState.main.width,
    });
    this.app.settings.trackWindowState("main", win);

    win.on("focus", () => {
      Menu.setApplicationMenu(this.app.menuManager.mainWindow.getMenu());
    });

    return win;
  }

  protected createSettingsWindow() {
    const win = createSettingsWindow({
      x: this.app.settings.windowsState.settings.x,
      y: this.app.settings.windowsState.settings.y,
      height: this.app.settings.windowsState.settings.height,
      width: this.app.settings.windowsState.settings.width,
      parent: this.main,
    });
    this.app.settings.trackWindowState("settings", win);

    win.on("focus", () => {
      Menu.setApplicationMenu(this.app.menuManager.settingsWindow.getMenu());
    });

    return win;
  }

  protected createCueSplitWindow() {
    const win = createCueSplitWindow({
      x: this.app.settings.windowsState.cueSplit.x,
      y: this.app.settings.windowsState.cueSplit.y,
      height: this.app.settings.windowsState.cueSplit.height,
      width: this.app.settings.windowsState.cueSplit.width,
      parent: this.main,
      closable: true,
      modal: true,
    });
    this.app.settings.trackWindowState("cueSplit", win);

    win.on("focus", () => {
      Menu.setApplicationMenu(null);
    });

    return win;
  }

  openSettingsWindow() {
    this.settings = this.createSettingsWindow();
    this.settings.on("closed", () => {
      this.settings = null;
    });
    this.settings.show();
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

      win
        .on("closed", () => {
          this.cuePreferences.delete(uuid);
        })
        .on("focus", () => {
          Menu.setApplicationMenu(
            this.app.menuManager.cuePreferenceWindow.getMenu(),
          );
        });

      win.show();

      this.cuePreferences.set(uuid, win);
    }
  }

  openCueSplitWindow() {
    this.cueSplit = this.createCueSplitWindow();
    this.cueSplit.on("closed", () => {
      this.cueSplit = null;
    });
    this.cueSplit.show();
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
