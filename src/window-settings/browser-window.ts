import path from "path";
import { BrowserWindow, BrowserWindowConstructorOptions } from "electron";
import { VTTSculptorBrowserWindow } from "shared/VttSculptorBrowserWindow";

export const createSettingsWindow = (
  options: BrowserWindowConstructorOptions = {},
): VTTSculptorBrowserWindow => {
  let browser_window: VTTSculptorBrowserWindow | null =
    new VTTSculptorBrowserWindow({
      title: __APP_NAME__,
      show: false,
      maximizable: false,
      webPreferences: {
        preload: path.join(__dirname, "window_settings_preload.js"),
      },
      ...options,
    });

  browser_window.on("closed", () => {
    browser_window = null;
  });

  browser_window.loadURL(`file://${__dirname}/window_settings.html`);

  return browser_window;
};
