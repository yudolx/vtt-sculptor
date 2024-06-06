import { takeEvery, call } from "redux-saga/effects";
import { backgroundProcessStarted } from "shared/actions";

export function* rootSaga() {
  yield takeEvery(backgroundProcessStarted.type, function* (action) {
    yield call(console.log, action.type);
  });
}
