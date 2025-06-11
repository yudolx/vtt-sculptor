import { BrowserWindow, Rectangle } from "electron";
import debounce from "lodash.debounce";

export class StateManager {
  private _debounceCache = new Map<
    string,
    { resize: () => void; move: () => void; close: () => void }
  >();

  constructor(
    protected options: {
      debounce: number;
      onChange: (name: "main" | "settings", bounds: Rectangle) => void;
    },
  ) {}

  changeHandler(name: "main" | "settings", win: BrowserWindow) {
    try {
      if (this.isNormal(win)) {
        this.emitChangeForWindow(name, win);
      }
    } catch (err) {
      console.error(err);
    }
  }

  closeHandler(name: "main" | "settings", win: BrowserWindow) {
    this.emitChangeForWindow(name, win);
    this.unmanage(name, win);
  }

  isNormal(win: BrowserWindow) {
    return !win.isMaximized() && !win.isMinimized() && !win.isFullScreen();
  }

  manage(name: "main" | "settings", win: BrowserWindow) {
    const change = debounce(
      () => this.changeHandler(name, win),
      this.options.debounce,
    );

    const close = () => this.closeHandler(name, win);

    win.on("resize", change);
    win.on("move", change);
    win.on("close", close);

    this._debounceCache.set(name, {
      resize: change,
      move: change,
      close,
    });
  }

  unmanage(name: string, win: BrowserWindow) {
    const callbackCache = this._debounceCache.get(name);

    if (callbackCache) {
      win.removeListener("resize", callbackCache.resize);
      win.removeListener("move", callbackCache.move);
      win.removeListener("close", callbackCache.close);
    }
  }

  emitChangeForWindow(name: "main" | "settings", win: BrowserWindow) {
    const winBounds = win.getBounds();
    this.options.onChange(name, winBounds);
  }
}
