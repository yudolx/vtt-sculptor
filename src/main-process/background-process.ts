import path from "path";
import { randomUUID } from "crypto";
import { BrowserWindow, ipcMain } from "electron";
import { createWindowMain } from "window-main/browser-window";
import { AppMenu } from "./appmenu";
import { ApplicationStore } from "./store";
import { ApplicationEventMap, ExtractArgs } from "shared/electron";
import { IVTTCue } from "shared/libs/vtt/vttcue";

export class BackgroundProcess {
  public store = new ApplicationStore();
  protected menu = new AppMenu(this);

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

    this.store.addListener("state-changed", (state) => {
      Object.values(this.window).forEach((win) => {
        if (win.isVisible()) {
          this.sendToWindow(win, "ipc/main/state-changed", state);
        }
      });
    });

    this.window.main.show();
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
    ipcMain.on("ipc/renderer/cues-changed", (event, cues: IVTTCue[]) => {
      this.store.patchCues(cues);
    });
  };

  public requestCurrentTimestamp = () =>
    new Promise<number>((resolve) => {
      const uuid = randomUUID();

      ipcMain.once(
        `ipc/main/request-video-current-time-${uuid}`,
        (event, time: number) => {
          resolve(time);
        },
      );

      this.sendToWindow(
        this.window.main,
        "ipc/main/request-video-current-time",
        { uuid },
      );
    });
}
