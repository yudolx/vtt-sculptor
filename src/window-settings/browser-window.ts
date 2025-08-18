import path from "path";
import { BrowserWindowConstructorOptions } from "electron";
import { VTTSculptorBrowserWindow } from "shared/VttSculptorBrowserWindow";
import { VttSculptorWindowMenu } from "main-process/menu/vttSculptorMenu";

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
