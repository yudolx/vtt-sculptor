import path from "path";
import type { BrowserWindowConstructorOptions } from "electron";
import { VTTSculptorBrowserWindow } from "@sculptor/helpers/VttSculptorBrowserWindow";
import type { VttSculptorWindowMenu } from "@sculptor/main-process/menu/vtt-sculptor-menu";

export const createSettingsWindow = (
  menu: VttSculptorWindowMenu,
  options: BrowserWindowConstructorOptions = {},
) => {
  let browserWindow: VTTSculptorBrowserWindow | null =
    new VTTSculptorBrowserWindow(menu, {
      title: __APP_NAME__,
      show: false,
      maximizable: false,
      webPreferences: {
        preload: path.join(__dirname, "window_settings_preload.js"),
      },
      ...options,
    });

  browserWindow.on("closed", () => {
    browserWindow = null;
  });

  browserWindow.loadURL(`file://${__dirname}/window_settings.html`);

  return browserWindow;
};
