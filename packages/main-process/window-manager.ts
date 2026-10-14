import { createWindowMain } from "@sculptor/window-main/browser-window";
import { createCuePreferencesWindow } from "@sculptor/window-cue-preferences/browser-window";
import { createSettingsWindow } from "@sculptor/window-settings/browser-window";
import { createCueSplitWindow } from "@sculptor/window-cue-split/browser-window";
import { VTTSculptorBrowserWindow } from "@sculptor/helpers/VttSculptorBrowserWindow";
import { BackgroundProcess } from "./background-process";
import { MainWindowMenu } from "./menu/main-window-menu";
import { SettingsWindowMenu } from "./menu/settings-window-menu";
import { CuePreferenceWindowMenu } from "./menu/cue-preference-menu";
import { CueSplitWindowMenu } from "./menu/cue-split-menu";

export class WindowManager {
  public mainWindowMenu: MainWindowMenu;
  public settingsWindowMenu: SettingsWindowMenu;
  public cuePreferenceWindowMenu: CuePreferenceWindowMenu;
  public cueSplitWindowMenu: CueSplitWindowMenu;

  public main: VTTSculptorBrowserWindow;
  public cuePreferences: VTTSculptorBrowserWindow | null = null;
  public settings: VTTSculptorBrowserWindow | null = null;
  public cueSplit: VTTSculptorBrowserWindow | null = null;

  constructor(protected app: BackgroundProcess) {
    this.mainWindowMenu = new MainWindowMenu(app);
    this.settingsWindowMenu = new SettingsWindowMenu(app);
    this.cuePreferenceWindowMenu = new CuePreferenceWindowMenu(app);
    this.cueSplitWindowMenu = new CueSplitWindowMenu(app);

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
    const win = createWindowMain(this.mainWindowMenu, {
      x: this.app.settings.windowsState.main.x,
      y: this.app.settings.windowsState.main.y,
      height: this.app.settings.windowsState.main.height,
      width: this.app.settings.windowsState.main.width,
    });

    this.app.settings.trackWindowState("main", win);

    return win;
  }

  openSettingsWindow() {
    this.settings = createSettingsWindow(this.settingsWindowMenu, {
      x: this.app.settings.windowsState.settings.x,
      y: this.app.settings.windowsState.settings.y,
      height: this.app.settings.windowsState.settings.height,
      width: this.app.settings.windowsState.settings.width,
      parent: this.main,
    });

    this.app.settings.trackWindowState("settings", this.settings);

    this.settings.on("closed", () => {
      this.settings = null;
    });

    this.settings.show();
  }

  openCuePreferencesWindow() {
    this.cuePreferences = createCuePreferencesWindow(
      this.cuePreferenceWindowMenu,
      {
        parent: this.main,
        frame: true,
        modal: true,
      },
    );

    this.cuePreferences.on("closed", () => {
      this.cuePreferences = null;
    });

    this.cuePreferences.show();
  }

  openCueSplitWindow() {
    this.cueSplit = createCueSplitWindow(this.cueSplitWindowMenu, {
      x: this.app.settings.windowsState.cueSplit.x,
      y: this.app.settings.windowsState.cueSplit.y,
      height: this.app.settings.windowsState.cueSplit.height,
      width: this.app.settings.windowsState.cueSplit.width,
      parent: this.main,
      closable: true,
      modal: true,
      useContentSize: true,
    });

    this.app.settings.trackWindowState("cueSplit", this.cueSplit);

    this.cueSplit.on("closed", () => {
      this.cueSplit = null;
    });

    this.cueSplit.show();
  }

  setGlobalShortcutsActive(value: boolean) {
    for (const window of this) {
      window.setGlobalShortcutsActive(value);
    }
  }

  public updateMenu() {
    for (const window of this) {
      window.updateMenu();
    }
  }
}
