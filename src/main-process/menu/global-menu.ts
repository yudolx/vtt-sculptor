import path from "path";
import { readFile, writeFile } from "fs/promises";
import { Menu, MenuItemConstructorOptions, dialog } from "electron";
import { parseWebVTT } from "shared/libs/vtt";
import { BackgroundProcess } from "../background-process";
import { IS_DARWIN } from "../constants";
import { stringifyVTT } from "shared/libs/vtt/WebVTTDeserializer";

export class GlobalMenu {
  protected menu: Menu;

  protected hotkeysActive = true;

  constructor(protected app: BackgroundProcess) {
    this.menu = Menu.buildFromTemplate([
      ...(IS_DARWIN && __DEVELOPMENT__
        ? [{ label: "MAC_OS_SKIPS_FIRST_MENU_ITEM_IN_DEVELOPMENT_FIX" }]
        : []),
      {
        label: "File",
        submenu: [
          {
            label: "New",
            id: "fileNew",
            accelerator: IS_DARWIN ? "Cmd+N" : "Ctrl+N",
            click: this.handleNew,
          },
          {
            label: "Open",
            id: "fileOpen",
            accelerator: IS_DARWIN ? "Cmd+O" : "Ctrl+O",
            click: this.handleOpen,
          },
          {
            type: "separator",
          },
          {
            label: "Save",
            id: "fileSave",
            accelerator: IS_DARWIN ? "Cmd+S" : "Ctrl+S",
            click: this.handleSave,
          },
          {
            label: "Save As",
            id: "fileSaveAs",
            accelerator: IS_DARWIN ? "Cmd+Shift+S" : "Ctrl+Shift+S",
            click: this.handleSaveAs,
          },
        ],
      },
      // The app will lack ability to copy and paste text without this menu on mac... for some reason
      ...(IS_DARWIN
        ? [
            {
              label: "Edit",
              submenu: [
                { role: "undo" } as const,
                { role: "redo" } as const,
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
      {
        label: "Subtitles",
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
        label: "Regions",
      },
      {
        label: "Video",
        submenu: [
          {
            label: "Load video",
            id: "videoLoadVideo",
            accelerator: IS_DARWIN ? "Cmd+L" : "Ctrl+L",
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

    this.update();
  }

  public update = () => {
    const saveMenuItem = this.menu.getMenuItemById("fileSave")!;
    const saveAsMenuItem = this.menu.getMenuItemById("fileSaveAs")!;

    {
      const file = this.app.store.subtitles.getFile();
      const hasCues = this.app.store.subtitles.getCues().length > 0;

      saveMenuItem.enabled = !!file;
      saveAsMenuItem.enabled = !!file || hasCues;
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

    const cues = this.app.store.subtitles.getCues();

    const totalCues = cues.length;
    if (totalCues > 0) {
      const result = dialog.showMessageBox({
        message:
          "This project contains unsaved changes. If you continue these changes will be lost",
        type: "warning",
        buttons: ["Continue", "Cancel"],
      });
    }

    this.app.store.setFileAndCues({
      cues: [],
      regions: {},
      file: null,
      styles: [],
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

    const { cues, regions, styles } = parseWebVTT(content.toString());

    this.app.store.setFileAndCues({
      cues,
      regions,
      styles,
      file: filePath,
    });
  };

  protected handleSave = async () => {
    if (!this.hotkeysActive) return;

    const file = this.app.store.subtitles.getFile()!;
    const filename = path.basename(file);

    const result = await dialog.showMessageBox(this.app.window.main, {
      message: `Overwrite the original file (${filename})?`,
      type: "question",
      buttons: ["Yes", "No"],
    });

    if (result.response === 0) {
      const vtt = stringifyVTT(
        this.app.store.subtitles.getCues(),
        this.app.store.subtitles.getRegions(),
        this.app.store.subtitles.getStyles(),
      );

      await writeFile(file, vtt);
    }
  };

  protected handleSaveAs = async () => {
    if (!this.hotkeysActive) return;

    const result = await dialog.showSaveDialog(this.app.window.main, {
      filters: [{ name: "WebVTT", extensions: ["vtt"] }],
      properties: ["createDirectory", "showOverwriteConfirmation"],
    });

    if (result.filePath) {
      const vtt = stringifyVTT(
        this.app.store.subtitles.getCues(),
        this.app.store.subtitles.getRegions(),
        this.app.store.subtitles.getStyles(),
      );
      await writeFile(result.filePath, vtt);
    }
  };

  protected handleNewSubtitle = async () => {
    if (!this.hotkeysActive) return;

    const time = Date.now();

    this.app.store.insertCue({
      type: "placeholder",
      uuid: crypto.randomUUID(),
      timestamp: time,
    });
  };

  protected handleRemoveSelectedSubtitles = () => {
    if (!this.hotkeysActive) return;
  };
}
