import { BrowserWindow, BrowserWindowConstructorOptions } from "electron";

export const createWindowMain = (
  options: BrowserWindowConstructorOptions = {},
): BrowserWindow => {
  let browser_window: BrowserWindow | null = new BrowserWindow({
    width: 1024,
    height: 768,
    title: __APP_NAME__,
    show: false,
    // frame: false,
    // transparent: true,
    ...options,
  });

  browser_window.on("closed", () => {
    browser_window = null;
  });

  browser_window.loadURL(`file://${__dirname}/window_main.html`);

  return browser_window;
};
