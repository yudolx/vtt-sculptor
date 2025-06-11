import path from "path";
import { BrowserWindow, dialog, app as electronApp, Rectangle } from "electron";
import { Stats, statSync, readFileSync, writeFileSync } from "fs";
import { writeFile as writeFileAsync } from "fs/promises";
import type { BackgroundProcess } from "main-process/background-process";
import { StateManager } from "./state-manager";
import { ISettings } from "./types";

const settingsDir = electronApp.getPath("userData");
const settingsFilename = "settings.json";
const settingsFilePath = path.join(settingsDir, settingsFilename);

const SAVE_DEBOUNCE_MS = 500;

export class SettingsStore {
  protected stateManager: StateManager;

  public externalCueIds: ISettings["externalCueIds"] = [];
  public generalSettings: ISettings["generalSettings"] = {
    tryDuete: true,
  };
  public windowsState: ISettings["windowsState"] = {
    main: {
      width: 720,
      height: 1280,
    },
    settings: {
      width: 600,
      height: 400,
    },
  };

  constructor() {
    this.stateManager = new StateManager({
      debounce: SAVE_DEBOUNCE_MS,
      onChange: this.handleStateManagerChange,
    });

    this.initSettings();
  }

  protected initSettings() {
    let settings = this.getState();

    try {
      const content = readCreateIfNotExists(
        settingsFilePath,
        JSON.stringify(settings),
      );

      settings = JSON.parse(content) as ISettings;
    } catch (e) {
      console.error(e);
      dialog.showMessageBox({
        message: "Error while reading or creating the configuration file",
        type: "error",
      });
      settings = this.getState();
    }

    this.externalCueIds = settings.externalCueIds;
    this.generalSettings = settings.generalSettings;
    this.windowsState = settings.windowsState;
  }

  public getState(): ISettings {
    return {
      externalCueIds: this.externalCueIds,
      generalSettings: this.generalSettings,
      windowsState: this.windowsState,
    };
  }

  public manageWindow(name: "main" | "settings", win: BrowserWindow) {
    this.stateManager.manage(name, win);
  }

  protected handleStateManagerChange = async (
    name: "main" | "settings",
    bounds: Rectangle,
  ) => {
    this.windowsState[name] = bounds;
    await this.flushState();
  };

  protected flushState = async () => {
    const state = this.getState();
    await writeFileAsync(settingsFilePath, JSON.stringify(state));
  };
}

const readCreateIfNotExists = (pathArg: string, defaultContent: string) => {
  let stats: Stats | null = null;
  try {
    stats = statSync(pathArg);
  } catch {
    console.log(`File ${pathArg} doesn't exist`);
  }

  if (!stats) {
    writeFileSync(pathArg, defaultContent);
  }

  return readFileSync(pathArg, "utf-8");
};
