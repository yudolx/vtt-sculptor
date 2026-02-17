import { Menu, MenuItemConstructorOptions, app as electronApp } from "electron";
import type { BackgroundProcess } from "../background-process";
import { IS_DARWIN } from "../constants";
import { VttSculptorWindowMenu } from "./vtt-sculptor-menu";

export class CueSplitWindowMenu extends VttSculptorWindowMenu {
  constructor(protected app: BackgroundProcess) {
    super();
  }

  override generateMenu() {
    return Menu.buildFromTemplate([
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
}
