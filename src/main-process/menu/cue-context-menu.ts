import { Menu } from "electron";
import type { BackgroundProcess } from "main-process/background-process";
import { IVTTCue } from "shared/libs/vtt/vttcue";

export class CueContextMenu {
  constructor(protected app: BackgroundProcess) {}

  public showCueContextMenu(event: Electron.IpcMainEvent, cue: IVTTCue) {
    const menu = Menu.buildFromTemplate([
      {
        label: "All settings",
        click: () => {
          this.app.window.openCuePreferencesWindow(cue.uuid);
        },
      },
      { type: "separator" },
      {
        label: "Pause on exit",
        type: "checkbox",
        checked: cue.pauseOnExit,
        click: () => {},
      },
      {
        label: "Vertical",
        type: "submenu",
        submenu: [
          {
            label: "Empty",
            type: "radio",
            checked: cue.vertical === "",
            click: () => {},
          },
          {
            label: "LR",
            type: "radio",
            checked: cue.vertical === "lr",
            click: () => {},
          },
          {
            label: "RL",
            type: "radio",
            checked: cue.vertical === "rl",
            click: () => {},
          },
        ],
      },
      {
        label: "Snap to lines",
        type: "checkbox",
        checked: cue.snapToLines,
        click: () => {},
      },
      {
        label: "Line align",
        type: "submenu",
        submenu: [
          {
            label: "Start",
            type: "radio",
            checked: cue.lineAlign === "start",
            click: () => {},
          },
          {
            label: "Center",
            type: "radio",
            checked: cue.lineAlign === "center",
            click: () => {},
          },
          {
            label: "End",
            type: "radio",
            checked: cue.lineAlign === "end",
            click: () => {},
          },
        ],
      },
      {
        label: "Position align",
        type: "submenu",
        submenu: [
          {
            label: "Auto",
            type: "radio",
            checked: cue.positionAlign === "auto",
            click: () => {},
          },
          {
            label: "Center",
            type: "radio",
            checked: cue.positionAlign === "center",
            click: () => {},
          },
          {
            label: "line-left",
            type: "radio",
            checked: cue.positionAlign === "line-left",
            click: () => {},
          },
          {
            label: "line-right",
            type: "radio",
            checked: cue.positionAlign === "line-right",
            click: () => {},
          },
        ],
      },
      {
        label: "Align",
        type: "submenu",
        submenu: [
          {
            label: "Start",
            type: "radio",
            checked: cue.align === "start",
            click: () => {},
          },
          {
            label: "End",
            type: "radio",
            checked: cue.align === "end",
            click: () => {},
          },
          {
            label: "Left",
            type: "radio",
            checked: cue.align === "left",
            click: () => {},
          },
          {
            label: "Right",
            type: "radio",
            checked: cue.align === "right",
            click: () => {},
          },
          {
            label: "Center",
            type: "radio",
            checked: cue.align === "center",
            click: () => {},
          },
        ],
      },
    ]);

    menu.popup();
  }
}
