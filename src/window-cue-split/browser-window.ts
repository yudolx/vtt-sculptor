import path from "path";
import { BrowserWindow, BrowserWindowConstructorOptions } from "electron";

export const createCueSplitWindow = (
  options: BrowserWindowConstructorOptions = {},
): BrowserWindow => {
  let browser_window: BrowserWindow | null = new BrowserWindow({
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
