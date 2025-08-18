import { Menu, BrowserWindow } from "electron";
import { VttSculptorWindowMenu } from "main-process/menu/vttSculptorMenu";

export class VTTSculptorBrowserWindow extends BrowserWindow {
  constructor(
    protected vttSculptorMenu: VttSculptorWindowMenu,
    ...options: ConstructorParameters<typeof BrowserWindow>
  ) {
    super(...options);

    this.on("focus", () => {
      this.updateMenu();
    });
  }

  updateMenu() {
    const menu = this.vttSculptorMenu.generateMenu();
    this.setMenu(menu);
    Menu.setApplicationMenu(menu);
  }

  setGlobalShortcutsActive(value: boolean) {
    this.vttSculptorMenu.setShortcutsActive(value);
  }

  show() {
    this.once("ready-to-show", () => {
      super.show();
    });
  }
}
