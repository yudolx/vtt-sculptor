import { all, call, fork, take } from "redux-saga/effects";
import { backgroundProcessStarted } from "shared/actions";
import { appmenu } from "./appmenu";
import { ipc } from "./ipc";

export function* rootSaga() {
  try {
    while (true) {
      yield take(backgroundProcessStarted.type);
      yield call(function* () {
        yield all([fork(appmenu), fork(ipc)]);
      });
    }
  } catch (e) {
    console.error(e);
  } finally {
    console.log("app terminated");
  }
}
