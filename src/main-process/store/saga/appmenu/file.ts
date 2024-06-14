import { dialog } from "electron";
import { call, put, select } from "redux-saga/effects";
import { readFile } from "fs/promises";
import { parseWebVTT } from "shared/libs/vtt";
import { subtitlesSlice } from "../../subtitles/slice";
import { GenPromise } from "shared/saga";
import { selectProject } from "main-process/store/subtitles/selectors";
import type { BackgroundProcess } from "main-process/background-process";

/** Context menu: File -> New */
export function* newfile(application: BackgroundProcess) {
  const project: ReturnType<typeof selectProject> = yield select(selectProject);

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
}

/** Context menu: File -> Open */
export function* openFile(application: BackgroundProcess) {
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
}
