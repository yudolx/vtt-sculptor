import path from "path";
import { BrowserWindow, BrowserWindowConstructorOptions } from "electron";
import { VTTSculptorBrowserWindow } from "shared/VttSculptorBrowserWindow";

export const createCuePreferencesWindow = (
  options: BrowserWindowConstructorOptions = {},
): VTTSculptorBrowserWindow => {
  let browser_window: VTTSculptorBrowserWindow | null =
    new VTTSculptorBrowserWindow({
      width: 500,
      height: 500,
      title: __APP_NAME__,
      show: false,
      resizable: false,
      minimizable: false,
      maximizable: false,
      webPreferences: {
        preload: path.join(__dirname, "window_cue_preferences_preload.js"),
      },
      ...options,
    });

  browser_window.on("closed", () => {
    browser_window = null;
  });

  browser_window.loadURL(`file://${__dirname}/window_cue_preferences.html`);

  return browser_window;
};
