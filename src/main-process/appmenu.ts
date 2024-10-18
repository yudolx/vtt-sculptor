import { readFile } from "fs/promises";
import { Menu, MenuItemConstructorOptions, dialog } from "electron";
import { IApplicationState } from "./store";
import { parseWebVTT } from "shared/libs/vtt";
import { selectProject } from "./store/subtitles/selectors";
import { BackgroundProcess } from "./background-process";
import { createVttCue } from "shared/libs/vtt/vttcue";
import { toFixedNumber } from "shared/to-fixed-number";

const DEFAULT_CUE_LENGTH_SEC = 3;

export class AppMenu {
  protected menu: Menu;

  protected hotkeysActive = true;

  constructor(protected app: BackgroundProcess) {
    this.menu = Menu.buildFromTemplate([
      {
        label: "File",
        submenu: [
          {
            label: "New",
            id: "fileNew",
            accelerator: __DARWIN__ ? "Cmd+N" : "Ctrl+N",
            click: this.handleNew,
          },
          {
            label: "Open",
            id: "fileOpen",
            accelerator: __DARWIN__ ? "Cmd+O" : "Ctrl+O",
            click: this.handleOpen,
          },
          {
            type: "separator",
          },
          {
            label: "Save",
            id: "fileSave",
            accelerator: __DARWIN__ ? "Cmd+S" : "Ctrl+S",
            click: this.handleSave,
          },
          {
            label: "Save As",
            id: "fileSaveAs",
            accelerator: __DARWIN__ ? "Cmd+Shift+S" : "Ctrl+Shift+S",
            click: this.handleSaveAs,
          },
        ],
      },
      {
        label: "Edit",
        submenu: [
          {
            label: "Insert new subtitle",
            id: "subtitlesNew",
            accelerator: "J",
            click: this.handleNewSubtitle,
          },
          {
            label: "Remove selected subtitles",
            id: "subtitlesRemove",
            accelerator: "delete",
            click: this.handleRemoveSelectedSubtitles,
          },
          { type: "separator" },
          {
            label: "Regions",
            id: "regions",
            click: () => {},
          },
        ],
      },
      {
        label: "Video",
        submenu: [
          {
            label: "Load video",
            id: "videoLoadVideo",
            accelerator: __DARWIN__ ? "Cmd+L" : "Ctrl+L",
            click: this.handleLoadVideo,
          },
        ],
      },
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

    Menu.setApplicationMenu(this.menu);

    const initialState = this.app.store.getState();
    this.update(initialState);

    this.app.store.addListener("state-changed", this.update);
  }

  public update = (newState: IApplicationState) => {
    const saveMenuItem = this.menu.getMenuItemById("fileSave")!;
    const saveAsMenuItem = this.menu.getMenuItemById("fileSaveAs")!;

    if (newState.subtitles.cues === null) {
      saveMenuItem.enabled = false;
      saveAsMenuItem.enabled = false;
    } else {
      saveMenuItem.enabled = true;
      saveAsMenuItem.enabled = true;
    }
  };

  public setShortcutsActive(value: boolean) {
    this.hotkeysActive = value;
  }

  protected handleLoadVideo = async () => {
    if (!this.hotkeysActive) return;

    const selectedFile = await dialog.showOpenDialog({
      properties: ["openFile", "showHiddenFiles"],
      filters: [{ name: "Web compatible movies", extensions: ["mp4", "webm"] }],
    });

    if (selectedFile.canceled) {
      return;
    }

    const [videoPath] = selectedFile.filePaths;

    this.app.store.setVideoPath(videoPath);
  };

  protected handleNew = () => {
    if (!this.hotkeysActive) return;

    const state = this.app.store.getState();
    const project = selectProject(state);

    const totalCues = project.cues.length;
    if (totalCues > 0) {
      const result = dialog.showMessageBox({
        message:
          "This project contains unsaved changes. If you continue these changes will be lost",
        type: "warning",
        buttons: ["Continue", "Cancel"],
      });

      console.log(result);
    }

    this.app.store.setFileAndCues({
      cues: [],
      regions: {},
      file: null,
    });
  };

  protected handleOpen = async () => {
    if (!this.hotkeysActive) return;

    const selectedFile = await dialog.showOpenDialog({
      properties: ["openFile", "showHiddenFiles"],
      filters: [{ name: "WebVTT Subtitles", extensions: ["vtt"] }],
    });

    if (selectedFile.canceled && selectedFile.filePaths.length !== 1) {
      return;
    }

    const filePath = selectedFile.filePaths.at(0)!;
    const content = await readFile(filePath, "utf-8");

    const { cues, regions } = parseWebVTT(content.toString());

    this.app.store.setFileAndCues({
      cues,
      regions,
      file: filePath,
    });
  };

  protected handleSave = () => {
    if (!this.hotkeysActive) return;
  };

  protected handleSaveAs = () => {
    if (!this.hotkeysActive) return;
  };

  protected handleNewSubtitle = async () => {
    if (!this.hotkeysActive) return;

    const time = await this.app.requestCurrentTimestamp();

    const cue = createVttCue({
      startTime: time,
      endTime: toFixedNumber(time + DEFAULT_CUE_LENGTH_SEC, 3),
      text: "",
    });

    this.app.store.insertCue(cue);
  };

  protected handleRemoveSelectedSubtitles = () => {
    if (!this.hotkeysActive) return;
  };
}
