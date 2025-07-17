import path from "path";
import { BrowserWindow, BrowserWindowConstructorOptions } from "electron";
import { VTTSculptorBrowserWindow } from "shared/VttSculptorBrowserWindow";

export const createWindowMain = (
  options: BrowserWindowConstructorOptions = {},
): BrowserWindow => {
  let browser_window: VTTSculptorBrowserWindow | null =
    new VTTSculptorBrowserWindow({
      title: __APP_NAME__,
      show: false,
      webPreferences: {
        preload: path.join(__dirname, "window_main_preload.js"),
        experimentalFeatures: true,
      },
      ...options,
    });

  browser_window.on("closed", () => {
    browser_window = null;
  });

  browser_window.loadURL(`file://${__dirname}/window_main.html`);

  return browser_window;
};
