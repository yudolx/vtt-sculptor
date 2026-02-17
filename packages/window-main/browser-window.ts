import path from "path";
import { BrowserWindowConstructorOptions } from "electron";
import { VTTSculptorBrowserWindow } from "@sculptor/helpers/VttSculptorBrowserWindow";
import { VttSculptorWindowMenu } from "@sculptor/main-process/menu/vtt-sculptor-menu";

export const createWindowMain = (
  menu: VttSculptorWindowMenu,
  options: BrowserWindowConstructorOptions = {},
) => {
  let browserWindow: VTTSculptorBrowserWindow | null =
    new VTTSculptorBrowserWindow(menu, {
      title: __APP_NAME__,
      show: false,
      webPreferences: {
        preload: path.join(__dirname, "window_main_preload.js"),
        experimentalFeatures: true,
      },
      ...options,
    });

  browserWindow.on("closed", () => {
    browserWindow = null;
  });

  browserWindow.loadURL(`file://${__dirname}/window_main.html`);

  return browserWindow;
};
