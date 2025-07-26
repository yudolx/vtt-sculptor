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
import { QueryKey } from "shared/constants";

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
      {
        label: "Edit",
        submenu: [
          {
            label: "Undo",
            id: "undo",
            accelerator: IS_DARWIN ? "Cmd+Z" : "Ctrl+Z",
            click: this.undo,
          },
          {
            label: "Redo",
            id: "redo",
            accelerator: IS_DARWIN ? "Cmd+Shift+Z" : "Ctrl+Shift+Z",
            click: this.redo,
          },
          {
            label: "New cue",
            id: "subtitlesNew",
            accelerator: "J",
            click: this.handleNewSubtitle,
          },
          ...(IS_DARWIN
            ? [
                { type: "separator" } as const,
                { role: "cut" } as const,
                { role: "copy" } as const,
                { role: "paste" } as const,
                { role: "pasteAndMatchStyle" } as const,
                { type: "separator" } as const,
              ]
            : []),
          {
            role: "delete",
            click: this.handleRemoveSelectedSubtitles,
          } as const,
          { role: "selectAll" } as const,
        ],
      },
      // The app will lack ability to copy and paste text without this menu on mac... for some reason
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
    const undoMenuItem = this.menu.getMenuItemById("undo")!;
    const redoMenuItem = this.menu.getMenuItemById("redo")!;

    {
      const file = this.app.store.subtitles.getFile();
      const hasCues = this.app.store.subtitles.getCues().length > 0;

      saveMenuItem.enabled = !!file;
      saveAsMenuItem.enabled = !!file || hasCues;
    }

    {
      const { historyManager } = this.app.store;
      const undoAction = historyManager.getLatestUndoableAction();
      const redoAction = historyManager.getLatestRedoableAction();

      undoMenuItem.enabled = !!undoAction;
      redoMenuItem.enabled = !!redoAction;
    }
  };

  public setShortcutsActive(value: boolean) {
    this.hotkeysActive = value;
  }

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

  protected undo = () => {
    this.app.store.undo();

    this.update();
    this.app.invalidateQuery(QueryKey.CuesList);
    this.app.invalidateQuery(QueryKey.ActiveCue);
  };

  protected redo = () => {
    this.app.store.redo();

    this.update();
    this.app.invalidateQuery(QueryKey.CuesList);
    this.app.invalidateQuery(QueryKey.ActiveCue);
  };
}
