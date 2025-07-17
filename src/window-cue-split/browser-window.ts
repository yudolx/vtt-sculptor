import path from "path";
import { BrowserWindow, BrowserWindowConstructorOptions } from "electron";
import { VTTSculptorBrowserWindow } from "shared/VttSculptorBrowserWindow";

export const createCueSplitWindow = (
  options: BrowserWindowConstructorOptions = {},
): VTTSculptorBrowserWindow => {
  let browser_window: VTTSculptorBrowserWindow | null =
    new VTTSculptorBrowserWindow({
      width: 400,
      height: 300,
      title: __APP_NAME__,
      show: false,
      resizable: true,
      minimizable: false,
      maximizable: false,
      webPreferences: {
        preload: path.join(__dirname, "window_cue_split_preload.js"),
      },
      ...options,
    });

  browser_window.on("closed", () => {
    browser_window = null;
  });

  browser_window.loadURL(`file://${__dirname}/window_cue_split.html`);

  return browser_window;
};
