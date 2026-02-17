import { BrowserWindow, Rectangle } from "electron";
import { ISettings } from "./types";

export class StateManager {
  private _callbackCache = new Map<
    string,
    { resize: () => void; move: () => void; close: () => void }
  >();

  constructor(
    protected options: {
      onChange: (
        name: keyof ISettings["windowsState"],
        bounds: Rectangle,
      ) => void;
    },
  ) {}

  changeHandler(name: keyof ISettings["windowsState"], win: BrowserWindow) {
    try {
      if (this.isNormal(win)) {
        this.emitChangeForWindow(name, win);
      }
    } catch (err) {
      console.error(err);
    }
  }

  closeHandler(name: keyof ISettings["windowsState"], win: BrowserWindow) {
    this.emitChangeForWindow(name, win);
    this.unmanage(name, win);
  }

  isNormal(win: BrowserWindow) {
    return !win.isMaximized() && !win.isMinimized() && !win.isFullScreen();
  }

  manage(name: keyof ISettings["windowsState"], win: BrowserWindow) {
    const change = () => this.changeHandler(name, win);
    const close = () => this.closeHandler(name, win);

    win.on("resize", change);
    win.on("move", change);
    win.on("close", close);

    this._callbackCache.set(name, {
      resize: change,
      move: change,
      close,
    });
  }

  unmanage(name: string, win: BrowserWindow) {
    const callbackCache = this._callbackCache.get(name);

    if (callbackCache) {
      win.removeListener("resize", callbackCache.resize);
      win.removeListener("move", callbackCache.move);
      win.removeListener("close", callbackCache.close);
    }
  }

  emitChangeForWindow(
    name: keyof ISettings["windowsState"],
    win: BrowserWindow,
  ) {
    const winBounds = win.getBounds();
    this.options.onChange(name, winBounds);
  }
}
