import { BrowserWindow } from "electron";

export class VTTSculptorBrowserWindow extends BrowserWindow {
  show() {
    this.once("ready-to-show", () => {
      super.show();
    });
  }
}
