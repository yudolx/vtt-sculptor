import path from "path";
import { BrowserWindow, BrowserWindowConstructorOptions } from "electron";

export const createSettingsWindow = (
  options: BrowserWindowConstructorOptions = {},
): BrowserWindow => {
  let browser_window: BrowserWindow | null = new BrowserWindow({
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
