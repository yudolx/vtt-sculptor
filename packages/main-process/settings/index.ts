import path from "path";
import { BrowserWindow, dialog, app as electronApp, Rectangle } from "electron";
import { Stats, statSync, readFileSync, writeFileSync } from "fs";
import { writeFile as writeFileAsync } from "fs/promises";
import { StateManager } from "./state-manager";
import { ISettings, validateSettings } from "./types";
import { migrationManifest } from "./migration";

const settingsDir = electronApp.getPath("userData");
const settingsFilename = "settings.json";
const settingsFilePath = path.join(settingsDir, settingsFilename);

const SAVE_DEBOUNCE_MS = 500;
const LATEST_SETTINGS_VERSION = 2;

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
    cueSplit: {
      width: 400,
      height: 300,
    },
  };
  public pluginsSettings: ISettings["plugins"] = {
    path: "/Users/numenor/Projects/vtt-subtitle-creator-2/plugins",
    list: {},
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

      settings = validateSettings(JSON.parse(content));
      settings =
        migrationManifest(settings, LATEST_SETTINGS_VERSION) ?? settings;
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
      version: LATEST_SETTINGS_VERSION,
      externalCueIds: this.externalCueIds,
      generalSettings: this.generalSettings,
      windowsState: this.windowsState,
      plugins: this.pluginsSettings,
    };
  }

  public trackWindowState(
    name: keyof ISettings["windowsState"],
    win: BrowserWindow,
  ) {
    this.stateManager.manage(name, win);
  }

  protected handleStateManagerChange = async (
    name: keyof ISettings["windowsState"],
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
