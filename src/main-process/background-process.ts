import path from "path";
import { ipcMain } from "electron";
import { createWindowMain } from "window-main/browser-window";
import { AppMenu } from "./appmenu";
import { ApplicationStore } from "./store";
import type { IVTTCue } from "shared/libs/vtt/vttcue";
import { QueryKey } from "shared/constants";

export class BackgroundProcess {
  public store = new ApplicationStore(this);
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
    this.window.main.show();
  }

  invalidateQuery = (query: QueryKey) => {
    Object.values(this.window).forEach((win) => {
      if (win.isVisible()) {
        win.webContents.send("ipc/main/invalidate-query", query);
      }
    });
  };

  private bindActionEvents = () => {
    ipcMain.handle("ipc/renderer/get-video-path", () =>
      this.store.video.getPath(),
    );
    ipcMain.handle("ipc/renderer/get-cues", () =>
      this.store.subtitles.getCues(),
    );
    ipcMain.handle("ipc/renderer/get-regions", () =>
      this.store.subtitles.getRegions(),
    );

    ipcMain
      .on("ipc/renderer/delete-cues", (event, cues: IVTTCue["uuid"][]) => {
        this.store.subtitles.deleteCues(cues);
        this.menu.update();
      })
      .on("ipc/renderer/cues-changed", (event, cues: IVTTCue[]) => {
        this.store.patchCues(cues);
        this.menu.update();
      });

    ipcMain
      .on("ipc/renderer/disable-hotkeys", () => {
        this.menu.setShortcutsActive(false);
      })
      .on("ipc/renderer/enable-hotkeys", () => {
        this.menu.setShortcutsActive(true);
      });

    // ipcMain
    //   .on("ipc/renderer/cues-changed", (event, cues: IVTTCue[]) => {
    //     this.store.patchCues(cues);
    //   })
    //   .on("ipc/renderer/delete-cues", (event, uuids: IVTTCue["uuid"][]) => {
    //     this.store.deleteCues(uuids);
    //   })
    //   .on("ipc/renderer/video-duration", (event, value: number | null) => {
    //     this.store.setVideoDuration(value);
    //   })
    //   .on("ipc/renderer/disable-hotkeys", () => {
    //     this.menu.setShortcutsActive(false);
    //   })
    //   .on("ipc/renderer/enable-hotkeys", () => {
    //     this.menu.setShortcutsActive(true);
    //   });
  };

  // public requestCurrentTimestamp = () =>
  //   new Promise<number>((resolve) => {
  //     const uuid = randomUUID();

  //     ipcMain.once(
  //       `ipc/main/request-video-current-time-${uuid}`,
  //       (event, time: number) => {
  //         resolve(time);
  //       },
  //     );

  //     this.sendToWindow(
  //       this.window.main,
  //       "ipc/main/request-video-current-time",
  //       { uuid },
  //     );
  //   });
}
