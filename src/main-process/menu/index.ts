import { MainWindowMenu } from "./main-window-menu";
import type { BackgroundProcess } from "main-process/background-process";
import { SettingsWindowMenu } from "./settings-window-menu";
import { CuePreferenceWindowMenu } from "./cue-preference-menu";
import { CueSplitWindowMenu } from "./cue-split-menu";

export class MenuManager {
  public mainWindow: MainWindowMenu;
  public settingsWindow: SettingsWindowMenu;
  public cuePreferenceWindow: CuePreferenceWindowMenu;
  public cueSplitWindow: CueSplitWindowMenu;

  constructor(public app: BackgroundProcess) {
    this.mainWindow = new MainWindowMenu(app);
    this.settingsWindow = new SettingsWindowMenu(app);
    this.cuePreferenceWindow = new CuePreferenceWindowMenu(app);
    this.cueSplitWindow = new CueSplitWindowMenu(app);
  }

  public update() {
    this.mainWindow.update();
  }

  public setGlobalShortcutsActive(active: boolean) {
    this.mainWindow.setShortcutsActive(active);
    this.settingsWindow.setShortcutsActive(active);
    this.cuePreferenceWindow.setShortcutsActive(active);
    this.cueSplitWindow.setShortcutsActive(active);
  }
}
