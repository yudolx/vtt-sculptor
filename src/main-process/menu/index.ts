import { GlobalMenu } from "./global-menu";
import type { BackgroundProcess } from "main-process/background-process";

export class MenuManager {
  public globalMenu: GlobalMenu;

  constructor(public app: BackgroundProcess) {
    this.globalMenu = new GlobalMenu(app);
  }

  public update() {
    this.globalMenu.update();
  }

  public setGlobalShortcutsActive(active: boolean) {
    this.globalMenu.setShortcutsActive(active);
  }
}
