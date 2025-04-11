import { IVTTCue } from "shared/libs/vtt/vttcue";
import { CueContextMenu } from "./cue-context-menu";
import { GlobalMenu } from "./global-menu";
import type { BackgroundProcess } from "main-process/background-process";

export class MenuManager {
  public globalMenu: GlobalMenu;
  public cueContextMenu: CueContextMenu;

  constructor(public app: BackgroundProcess) {
    this.globalMenu = new GlobalMenu(app);
    this.cueContextMenu = new CueContextMenu(app);
  }

  public update() {
    this.globalMenu.update();
  }

  public setGlobalShortcutsActive(active: boolean) {
    this.globalMenu.setShortcutsActive(active);
  }

  public showCueContextMenu(event: Electron.IpcMainEvent, cue: IVTTCue) {
    this.cueContextMenu.showCueContextMenu(event, cue);
  }
}
