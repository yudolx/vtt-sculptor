import path from "path";
import { BrowserWindow, BrowserWindowConstructorOptions } from "electron";

export const createWindowMain = (
  options: BrowserWindowConstructorOptions = {},
): BrowserWindow => {
  let browser_window: BrowserWindow | null = new BrowserWindow({
    width: 720,
    height: 1280,
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
