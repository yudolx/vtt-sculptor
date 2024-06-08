import { Menu, MenuItemConstructorOptions } from "electron";
import { menu } from "shared/ui/actions/menu";
import { IApplicationState, store } from "./store";

export class AppMenu {
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
    store.dispatch(menu.video.load());
  };

  protected handleNew = () => {
    store.dispatch(menu.file.new());
  };

  protected handleOpen = async () => {
    store.dispatch(menu.file.open());
  };

  protected handleSave = () => {};

  protected handleSaveAs = () => {};

  protected handleNewSubtitle = () => {};

  protected handleRemoveSelectedSubtitles = () => {};
}
