import path from "path";
import { BrowserWindowConstructorOptions } from "electron";
import { VTTSculptorBrowserWindow } from "shared/VttSculptorBrowserWindow";
import { VttSculptorWindowMenu } from "main-process/menu/vtt-sculptor-menu";

export const createCuePreferencesWindow = (
  menu: VttSculptorWindowMenu,
  options: BrowserWindowConstructorOptions = {},
): VTTSculptorBrowserWindow => {
  let browserWindow: VTTSculptorBrowserWindow | null =
    new VTTSculptorBrowserWindow(menu, {
      width: 500,
      height: 500,
      title: __APP_NAME__,
      show: false,
      resizable: false,
      minimizable: false,
      maximizable: false,
      webPreferences: {
        preload: path.join(__dirname, "window_cue_preferences_preload.js"),
      },
      ...options,
    });

  browserWindow.on("closed", () => {
    browserWindow = null;
  });

  browserWindow.loadURL(`file://${__dirname}/window_cue_preferences.html`);

  return browserWindow;
};
