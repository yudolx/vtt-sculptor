import { all, call, fork, take } from "redux-saga/effects";
import { backgroundProcessStarted } from "shared/actions";
import { appmenu } from "./appmenu";
import { ipc } from "./ipc";
import { dialog } from "electron";

export function* rootSaga() {
  try {
    while (true) {
      const appStartedAction: ReturnType<typeof backgroundProcessStarted> =
        yield take(backgroundProcessStarted);

      yield call(function* () {
        yield all([fork(appmenu, appStartedAction.payload), fork(ipc)]);
      });
    }
  } catch (e) {
    if (e instanceof Error) {
      dialog.showMessageBox({
        type: "error",
        message: `${e.message}\n\n${e.stack}`,
      });
    }
    console.error(e);
  } finally {
    console.log("app terminated");
  }
}
