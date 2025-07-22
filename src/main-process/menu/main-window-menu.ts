import path from "path";
import { writeFile, stat } from "fs/promises";
import {
  app as electronApp,
  Menu,
  MenuItemConstructorOptions,
  dialog,
} from "electron";
import { BackgroundProcess } from "../background-process";
import { IS_DARWIN, supportedVideoExtensions } from "../constants";
import { stringifyVTT } from "shared/libs/vtt/WebVTTDeserializer";

export class MainWindowMenu {
  protected menu: Menu;

  protected hotkeysActive = true;

  constructor(protected app: BackgroundProcess) {
    this.menu = Menu.buildFromTemplate([
      // macOS-specific application menu
      ...(IS_DARWIN
        ? [
            {
              label: electronApp.getName(),
              submenu: [
                { role: "about" } as const,
                {
                  label: "Settings",
                  id: "fileOpen",
                  click: this.handleSettingsClick,
                },
                { type: "separator" } as const,
                { role: "quit" } as const,
              ],
            },
          ]
        : []),
      {
        label: "File",
        submenu: [
          // {
          //   label: "New",
          //   id: "fileNew",
          //   accelerator: IS_DARWIN ? "Cmd+N" : "Ctrl+N",
          //   click: this.handleNew,
          // },
          {
            label: "Open",
            id: "fileOpen",
            accelerator: IS_DARWIN ? "Cmd+O" : "Ctrl+O",
            click: this.handleOpen,
          },
          {
            label: "Open Recent",
            role: "recentDocuments",
            submenu: [
              {
                label: "Clear Recent",
                role: "clearRecentDocuments",
              },
            ],
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
          {
            type: "separator",
          },
          {
            label: "Close all",
            id: "fileCloseAll",
            click: this.handleCloseAll,
          },
          ...(!IS_DARWIN
            ? [
                {
                  type: "separator",
                } as const,
                {
                  label: "Settings",
                  id: "fileOpen",
                  click: this.handleSettingsClick,
                },
              ]
            : []),
        ],
      },
      // The app will lack ability to copy and paste text without this menu on mac... for some reason
      ...(IS_DARWIN
        ? [
            {
              label: "Edit",
              submenu: [
                {
                  label: "New cue",
                  id: "subtitlesNew",
                  accelerator: "J",
                  click: this.handleNewSubtitle,
                },
                { type: "separator" } as const,
                { role: "cut" } as const,
                { role: "copy" } as const,
                { role: "paste" } as const,
                { role: "pasteAndMatchStyle" } as const,
                {
                  role: "delete",
                  click: this.handleRemoveSelectedSubtitles,
                } as const,
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

    this.update();
  }

  getMenu() {
    return this.menu;
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

  // protected handleLoadVideo = async () => {
  //   if (!this.hotkeysActive) return;

  //   const selectedFile = await dialog.showOpenDialog({
  //     properties: ["openFile", "showHiddenFiles"],
  //     filters: [
  //       { name: "WEB compatible videos", extensions: supportedVideoExtensions },
  //     ],
  //   });

  //   if (selectedFile.canceled) {
  //     return;
  //   }

  //   const [videoPath] = selectedFile.filePaths;
  //   this.app.store.setVideoPath(videoPath);
  // };

  // protected handleNew = () => {
  //   if (!this.hotkeysActive) return;

  //   const cues = this.app.store.subtitles.getCues();

  //   const totalCues = cues.length;
  //   if (totalCues > 0) {
  //     const result = dialog.showMessageBox({
  //       message:
  //         "This project contains unsaved changes. If you continue these changes will be lost",
  //       type: "warning",
  //       buttons: ["Continue", "Cancel"],
  //     });
  //   }

  //   this.app.store.setFileAndCues({
  //     cues: [],
  //     regions: {},
  //     file: null,
  //     styles: [],
  //   });
  // };

  protected handleOpen = async () => {
    if (!this.hotkeysActive) return;

    const selectedFile = await dialog.showOpenDialog({
      properties: ["openFile", "showHiddenFiles"],
      filters: [
        {
          name: "Subtitles or Video",
          extensions: ["vtt", ...supportedVideoExtensions],
        },
      ],
    });

    if (selectedFile.canceled && selectedFile.filePaths.length !== 1) {
      return;
    }

    const filePath = selectedFile.filePaths.at(0)!;
    this.app.fileOpener.open(null, filePath);
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

  protected handleCloseAll = () => {
    this.app.store.setVideoPath(null);
    this.app.store.setFileAndCues({
      cues: [],
      regions: {},
      styles: [],
      file: null,
    });
  };

  protected handleNewSubtitle = async () => {
    if (!this.hotkeysActive) return;
    this.app.requestInsertNewCue();
  };

  protected handleRemoveSelectedSubtitles = () => {
    if (!this.hotkeysActive) return;
  };

  protected handleSettingsClick = () => {
    this.app.window.openSettingsWindow();
  };
}
