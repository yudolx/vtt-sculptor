import path from "path";
import { writeFile } from "fs/promises";
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
import { VttSculptorWindowMenu } from "./vtt-sculptor-menu";

export class MainWindowMenu extends VttSculptorWindowMenu {
  constructor(protected app: BackgroundProcess) {
    super();
  }

  generateMenu(): Menu {
    const { historyManager } = this.app.store;
    const undoAction = historyManager.getLatestUndoableAction();
    const redoAction = historyManager.getLatestRedoableAction();

    const subtitlesVisibleValue = this.app.store.video.getSubtitlesVisible();

    const file = this.app.store.subtitles.getFile();
    const hasCues = this.app.store.subtitles.getCues().length > 0;

    return Menu.buildFromTemplate([
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
            enabled: !!file,
          },
          {
            label: "Save As",
            id: "fileSaveAs",
            accelerator: IS_DARWIN ? "Cmd+Shift+S" : "Ctrl+Shift+S",
            click: this.handleSaveAs,
            enabled: !!file || hasCues,
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
            enabled: !!undoAction,
          },
          {
            label: "Redo",
            id: "redo",
            accelerator: IS_DARWIN ? "Cmd+Shift+Z" : "Ctrl+Shift+Z",
            click: this.redo,
            enabled: !!redoAction,
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
      {
        label: "Video",
        submenu: [
          {
            id: "videoToggleSubtitlesVisible",
            accelerator: IS_DARWIN ? "Cmd+H" : "Ctrl+H",
            label: subtitlesVisibleValue ? "Hide subtitles" : "Show subtitles",
            click: this.toggleVideoSubtitlesVisible,
          },
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
    if (!this.hotkeysActive) return;
    this.app.store.undo();

    this.app.invalidateQuery(QueryKey.CuesList);
    this.app.invalidateQuery(QueryKey.ActiveCue);
  };

  protected redo = () => {
    if (!this.hotkeysActive) return;
    this.app.store.redo();

    this.app.invalidateQuery(QueryKey.CuesList);
    this.app.invalidateQuery(QueryKey.ActiveCue);
  };

  protected toggleVideoSubtitlesVisible = () => {
    if (!this.hotkeysActive) return;

    if (this.app.store.video.getSubtitlesVisible()) {
      this.app.store.video.setSubtitlesVisible(false);
    } else {
      this.app.store.video.setSubtitlesVisible(true);
    }

    this.app.invalidateQuery(QueryKey.VideoSubtitlesVisible);
    this.app.window.updateMenu();
  };
}
