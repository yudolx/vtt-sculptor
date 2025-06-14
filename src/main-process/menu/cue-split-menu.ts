import { Menu, MenuItemConstructorOptions, app as electronApp } from "electron";
import type { BackgroundProcess } from "main-process/background-process";
import { IS_DARWIN } from "main-process/constants";

export class CueSplitWindowMenu {
  protected menu: Menu;
  protected hotkeysActive = true;

  constructor(protected app: BackgroundProcess) {
    this.menu = Menu.buildFromTemplate([
      // macOS-specific application menu
      ...(IS_DARWIN
        ? [
            {
              label: electronApp.getName(),
              submenu: [{ role: "quit" } as const],
            },
          ]
        : []),
      // The app will lack ability to copy and paste text without this menu on mac... for some reason
      ...(IS_DARWIN
        ? [
            {
              label: "Edit",
              submenu: [
                { type: "separator" } as const,
                { role: "cut" } as const,
                { role: "copy" } as const,
                { role: "paste" } as const,
                { role: "pasteAndMatchStyle" } as const,
                { role: "delete" } as const,
                { role: "selectAll" } as const,
              ],
            },
          ]
        : []),
      ...(__DEVELOPMENT__
        ? [
            {
              label: "Development",
              submenu: [
                {
                  id: "developmentToggleDevtools",
                  label: "Toggle Devtools",
                  role: "toggleDevTools",
                },
              ],
            } as MenuItemConstructorOptions,
          ]
        : []),
    ]);
  }

  getMenu() {
    return this.menu;
  }

  public setShortcutsActive(value: boolean) {
    this.hotkeysActive = value;
  }
}
