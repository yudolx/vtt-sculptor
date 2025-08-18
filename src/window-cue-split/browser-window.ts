import path from "path";
import { BrowserWindowConstructorOptions } from "electron";
import { VTTSculptorBrowserWindow } from "shared/VttSculptorBrowserWindow";
import { VttSculptorWindowMenu } from "main-process/menu/vttSculptorMenu";

export const createCueSplitWindow = (
  menu: VttSculptorWindowMenu,
  options: BrowserWindowConstructorOptions = {},
) => {
  let browserWindow: VTTSculptorBrowserWindow | null =
    new VTTSculptorBrowserWindow(menu, {
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

  browserWindow.on("closed", () => {
    browserWindow = null;
  });

  browserWindow.loadURL(`file://${__dirname}/window_cue_split.html`);

  return browserWindow;
};
