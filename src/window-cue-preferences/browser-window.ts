import path from "path";
import { BrowserWindow, BrowserWindowConstructorOptions } from "electron";

export const createCuePreferencesWindow = (
  options: BrowserWindowConstructorOptions = {},
): BrowserWindow => {
  let browser_window: BrowserWindow | null = new BrowserWindow({
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
