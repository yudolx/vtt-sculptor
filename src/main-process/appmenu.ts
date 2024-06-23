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

  public update(newState: IApplicationState) {
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
    const selectedFile: GenPromise<typeof dialog.showOpenDialog> = yield call(
      dialog.showOpenDialog,
      {
        properties: ["openFile", "showHiddenFiles"],
        filters: [
          { name: "Web compatible movies", extensions: ["mp4", "webm"] },
        ],
      },
    );

    if (selectedFile.canceled) {
      return;
    }

    const [videoPath] = selectedFile.filePaths;

    yield put(videoSlice.actions.setPath({ path: videoPath }));
  };

  protected handleNew = () => {
    const project: ReturnType<typeof selectProject> =
      yield select(selectProject);

    const totalCues = project.cues?.length ?? 0;
    if (totalCues > 0) {
      const result: GenPromise<typeof dialog.showMessageBox> = yield call(
        dialog.showMessageBox,
        {
          message:
            "This project contains unsaved changes. If you continue these changes will not be saved",
          type: "warning",
          buttons: ["Continue", "Cancel"],
        },
      );

      console.log(result);
    }

    yield put(
      subtitlesSlice.actions.setFileAndCues({
        cues: [],
        regions: {},
        file: null,
      }),
    );
  };

  protected handleOpen = async () => {
    const selectedFile: GenPromise<typeof dialog.showOpenDialog> = yield call(
      dialog.showOpenDialog,
      {
        properties: ["openFile", "showHiddenFiles"],
        filters: [{ name: "WebVTT Subtitles", extensions: ["vtt"] }],
      },
    );

    if (selectedFile.canceled && selectedFile.filePaths.length !== 1) {
      return;
    }

    const filePath = selectedFile.filePaths.at(0)!;
    const content: GenPromise<typeof readFile> = yield call(
      readFile,
      filePath,
      "utf-8",
    );

    const { cues, regions } = parseWebVTT(content.toString());

    yield put(
      subtitlesSlice.actions.setFileAndCues({
        cues,
        regions,
        file: filePath,
      }),
    );
  };

  protected handleSave = () => {};

  protected handleSaveAs = () => {};

  protected handleNewSubtitle = () => {
    application.window.main.webContents.send(
      IPCMainEvent.RequestVideoCurentTime().type,
    );

    const currentVideoTimeAction: PayloadAction<number> = yield take(
      IPCRendererEvent.VideoCurrentTime,
    );
  };

  protected handleRemoveSelectedSubtitles = () => {};
}
