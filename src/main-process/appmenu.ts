import { Menu, MenuItemConstructorOptions, dialog, ipcMain } from "electron";
import { readFile } from "fs/promises";
import { IApplicationState } from "./store";
import type { BackgroundProcess } from "./background-process";
import { parseWebVTT } from "shared/libs/vtt";

export class AppMenu {
  protected menu: Menu;

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
  }

  public update(newState: Partial<IApplicationState>) {
    const saveMenuItem = this.menu.getMenuItemById("fileSave")!;
    const saveAsMenuItem = this.menu.getMenuItemById("fileSaveAs")!;

    if (newState.subtitles) {
      if (newState.subtitles.cues === null) {
        saveMenuItem.enabled = false;
        saveAsMenuItem.enabled = false;
      } else {
        saveMenuItem.enabled = true;
        saveAsMenuItem.enabled = true;
      }
    }
  }

  protected handleLoadVideo = async () => {
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

  protected handleNew = async () => {
    const cues = this.app.store.subtitles.cues;

    const totalCues = cues?.length ?? 0;
    if (totalCues > 0) {
      const result = await dialog.showMessageBox({
        message:
          "This project contains unsaved changes. If you continue these changes will not be saved",
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
    const selectedFile = dialog.showOpenDialog({
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

  protected handleSave = () => {};

  protected handleSaveAs = () => {};

  protected handleNewSubtitle = () => {
    ipcMain.once("ipc/renderer/video-current-time", (event, currentTime) => {
      console.log(currentTime);
    });
    this.app.sendToWindow(
      this.app.window.main,
      "ipc/main/request-video-current-time",
    );
  };

  protected handleRemoveSelectedSubtitles = () => {};
}
