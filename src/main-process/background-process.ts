import path from "path";
import { BrowserWindow, ipcMain } from "electron";
import { createWindowMain } from "window-main/browser-window";
import { AppMenu } from "./appmenu";
import { ApplicationStore } from "./store";
import { ApplicationEventMap, ExtractArgs } from "shared/electron";

export class BackgroundProcess {
  protected menu = new AppMenu(this);
  public store = new ApplicationStore();

  public window = {
    main: createWindowMain({
      webPreferences: {
        preload: path.join(__dirname, "window_main_preload.js"),
        experimentalFeatures: true,
      },
    }),
  };

  constructor() {
    this.bindActionEvents();

    this.menu.update(this.store.getState());

    this.window.main.show();

    this.store.subscribe((state) => {
      this.menu.update(state);

      Object.values(this.window).forEach((win) => {
        if (win.isVisible()) {
          this.sendToWindow(win, "ipc/main/state-changed", state);
        }
      });
    });
  }

  sendToWindow<K extends keyof ApplicationEventMap>(
    win: BrowserWindow,
    evt: K,
    ...args: ExtractArgs<ApplicationEventMap, K>
  ) {
    win.webContents.send(evt, ...args);
  }

  private bindActionEvents = () => {
    ipcMain.handle("ipc/renderer/get-state", () => this.store.getState());
  };
}
