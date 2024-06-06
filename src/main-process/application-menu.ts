import { Menu, MenuItemConstructorOptions, dialog } from "electron";
import * as fs from "fs/promises";
import { appMenuFileNew, appMenuFileOpen, setVideoPath } from "shared/actions";
import { IApplicationState, store } from "./store";
import { parseWebVTT } from "shared/libs/vtt";

export class ApplicationMenu {
  protected menu: Menu;

  constructor() {
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

  public storeUpdated(newState: IApplicationState) {
    const saveMenuItem = this.menu.getMenuItemById("fileSave")!;
    const saveAsMenuItem = this.menu.getMenuItemById("fileSaveAs")!;

    if (newState.subtitles.cues === null) {
      saveMenuItem.enabled = false;
      saveAsMenuItem.enabled = false;
    } else {
      saveMenuItem.enabled = true;
      saveAsMenuItem.enabled = true;
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

    store.dispatch(setVideoPath(videoPath));
  };

  protected handleNew = () => {
    store.dispatch(appMenuFileNew());
  };

  protected handleOpen = async () => {
    const selectedFile = await dialog.showOpenDialog({
      properties: ["openFile", "showHiddenFiles"],
      filters: [{ name: "WebVTT Subtitles", extensions: ["vtt"] }],
    });

    if (selectedFile.canceled && selectedFile.filePaths.length !== 1) {
      return;
    }

    const filePath = selectedFile.filePaths.at(0)!;
    const content = await fs.readFile(filePath, "utf-8");

    const cues = parseWebVTT(content);

    store.dispatch(appMenuFileOpen({ file: filePath, cues }));
  };

  protected handleSave = () => {};

  protected handleSaveAs = () => {};

  protected handleNewSubtitle = () => {};

  protected handleRemoveSelectedSubtitles = () => {};
}
