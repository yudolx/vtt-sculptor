import { createWindowMain } from "window-main/browser-window";
import { createCuePreferencesWindow } from "window-cue-preferences/browser-window";
import { Menu } from "electron";
import { createSettingsWindow } from "window-settings/browser-window";
import { BackgroundProcess } from "./background-process";
import { createCueSplitWindow } from "window-cue-split/browser-window";
import { VTTSculptorBrowserWindow } from "shared/VttSculptorBrowserWindow";

export class WindowManager {
  public main: VTTSculptorBrowserWindow;
  public cuePreferences: VTTSculptorBrowserWindow | null = null;
  public settings: VTTSculptorBrowserWindow | null = null;
  public cueSplit: VTTSculptorBrowserWindow | null = null;

  constructor(protected app: BackgroundProcess) {
    this.main = this.createMainWindow();
  }

  *[Symbol.iterator]() {
    yield this.main;

    if (this.cuePreferences) {
      yield this.cuePreferences;
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

  openSettingsWindow() {
    this.settings = createSettingsWindow({
      x: this.app.settings.windowsState.settings.x,
      y: this.app.settings.windowsState.settings.y,
      height: this.app.settings.windowsState.settings.height,
      width: this.app.settings.windowsState.settings.width,
      parent: this.main,
    });

    this.app.settings.trackWindowState("settings", this.settings);

    this.settings
      .on("focus", () => {
        Menu.setApplicationMenu(this.app.menuManager.settingsWindow.getMenu());
      })
      .on("closed", () => {
        this.settings = null;
      });

    this.settings.show();
  }

  openCuePreferencesWindow() {
    this.cuePreferences = createCuePreferencesWindow({
      parent: this.main,
      frame: true,
      modal: true,
    });

    this.cuePreferences
      .on("closed", () => {
        this.cuePreferences = null;
      })
      .on("focus", () => {
        Menu.setApplicationMenu(
          this.app.menuManager.cuePreferenceWindow.getMenu(),
        );
      });

    this.cuePreferences.show();
  }

  openCueSplitWindow() {
    this.cueSplit = createCueSplitWindow({
      x: this.app.settings.windowsState.cueSplit.x,
      y: this.app.settings.windowsState.cueSplit.y,
      height: this.app.settings.windowsState.cueSplit.height,
      width: this.app.settings.windowsState.cueSplit.width,
      parent: this.main,
      closable: true,
      modal: true,
    });

    this.app.settings.trackWindowState("cueSplit", this.cueSplit);

    this.cueSplit
      .on("focus", () => {
        Menu.setApplicationMenu(null);
      })
      .on("closed", () => {
        this.cueSplit = null;
      });

    this.cueSplit.show();
  }
}
