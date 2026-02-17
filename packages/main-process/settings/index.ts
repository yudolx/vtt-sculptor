import path from "path";
import { BrowserWindow, dialog, app as electronApp, Rectangle } from "electron";
import { Stats, statSync, readFileSync, writeFileSync } from "fs";
import { writeFile as writeFileAsync } from "fs/promises";
import merge from "lodash/merge";
import { StateManager } from "./state-manager";
import { ISettings, validateSettings } from "./types";
import { migrationManifest } from "./migration";
import { DeepPartial } from "@sculptor/helpers/typeUtils";
import { debounce } from "lodash";

const settingsDir = electronApp.getPath("userData");
const settingsFilename = "settings.json";
const settingsFilePath = path.join(settingsDir, settingsFilename);

const SAVE_DEBOUNCE_MS = 500;
const LATEST_SETTINGS_VERSION = 3;

const getDefaultSettings = (): ISettings => ({
  version: LATEST_SETTINGS_VERSION,
  plugins: {},
  general: {
    tryDuete: true,
    pluginsDirectory: "",
  },
  styles: {
    externalCueIds: [],
  },
  windowsState: {
    main: {
      width: 720,
      height: 1280,
      leftWidth: 720,
    },
    settings: {
      width: 600,
      height: 400,
    },
    cueSplit: {
      width: 400,
      height: 300,
    },
  },
});

export class SettingsStore {
  protected stateManager: StateManager;
  protected settings: ISettings = getDefaultSettings();

  constructor() {
    this.stateManager = new StateManager({
      onChange: this.handleStateManagerChange,
    });

    this.initSettings();
  }

  get windowsState() {
    return this.settings.windowsState;
  }

  get pluginsDirectory() {
    return this.settings.general.pluginsDirectory;
  }

  get externalCueIds() {
    return this.settings.styles.externalCueIds;
  }

  set externalCueIds(value: string[]) {
    this.settings.styles.externalCueIds = value;
  }

  protected initSettings() {
    try {
      const content = readCreateIfNotExists(
        settingsFilePath,
        JSON.stringify(this.settings, null, 2),
      );

      this.settings = validateSettings(JSON.parse(content));
      this.settings =
        migrationManifest(this.settings, LATEST_SETTINGS_VERSION) ??
        this.settings;
    } catch (e) {
      console.error(e);
      dialog.showMessageBox({
        message: "Error while reading or creating the configuration file",
        type: "error",
      });
    }
  }

  public getState(): ISettings {
    return this.settings;
  }

  public setState(settings: DeepPartial<ISettings>) {
    merge(this.settings, settings);
    this.flushState();
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
    this.settings.windowsState[name] = {
      ...this.settings.windowsState[name],
      ...bounds,
    };
    await this.flushState();
  };

  protected flushState = debounce(async () => {
    // debouncing an async function needs a custom implementation
    const state = this.getState();
    await writeFileAsync(settingsFilePath, JSON.stringify(state, null, 2));
  }, SAVE_DEBOUNCE_MS);
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

  if (!stats) {
    return defaultContent;
  } else {
    return readFileSync(pathArg, "utf-8");
  }
};
