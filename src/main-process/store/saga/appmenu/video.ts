import { dialog } from "electron";
import { call, put } from "redux-saga/effects";
import { GenPromise } from "shared/saga";
import { videoSlice } from "../../video/slice";

export function* loadVideo() {
  const selectedFile: GenPromise<typeof dialog.showOpenDialog> = yield call(
    dialog.showOpenDialog,
    {
      properties: ["openFile", "showHiddenFiles"],
      filters: [{ name: "Web compatible movies", extensions: ["mp4", "webm"] }],
    },
  );

  if (selectedFile.canceled) {
    return;
  }

  const [videoPath] = selectedFile.filePaths;

  yield put(videoSlice.actions.setPath({ path: videoPath }));
}
