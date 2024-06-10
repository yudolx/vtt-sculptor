import { ipcMain } from "electron";
import path from "path";
import { createWindowMain } from "window-main/browser-window";
import { AppMenu } from "./appmenu";
import { store } from "./store";
import { IPCMainEvent, IPCRendererEvent } from "shared/preload";

export class BackgroundProcess {
  private menu = new AppMenu();

  private window = {
    main: createWindowMain({
      webPreferences: {
        preload: path.join(__dirname, "window_main_preload.js"),
        experimentalFeatures: true,
      },
    }),
  };

  constructor() {
    this.bindActionEvents();

    this.window.main.show();

    const initialState = store.getState();
    this.menu.storeUpdated(initialState);

    store.subscribe(() => {
      const state = store.getState();

      this.menu.storeUpdated(state);

      Object.values(this.window).forEach((win) => {
        if (win.isVisible()) {
          win.webContents.send(IPCMainEvent.StateChanged, state);
        }
      });
    });
  }

  bindActionEvents = () => {
    ipcMain.handle(IPCRendererEvent.GetState, () => {
      return store.getState();
    });
  };
}
