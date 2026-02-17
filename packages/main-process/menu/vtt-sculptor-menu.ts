import { Menu } from "electron";

export abstract class VttSculptorWindowMenu {
  protected hotkeysActive = true;

  public setShortcutsActive(value: boolean) {
    this.hotkeysActive = value;
  }

  public generateMenu(): Menu {
    throw new Error("Not implemented");
  }
}
