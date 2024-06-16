import { IpcRendererEvent } from "electron";
import { IApplicationState } from "main-process/store";
import createSagaMiddleware, { runSaga } from "redux-saga";
import { effectTypes } from "redux-saga/effects";
import { call, put, select, take } from "typed-redux-saga";

const noop = (...args: any[]): any => {};

const ipcMainCommunicator = new (class {
  saga = function* () {
    const test = yield* select((state: IApplicationState) => state.video.path);
    console.log(test);
    yield* put({ type: "random action" });
    // while (true) {
    //   const action = yield* take("*");
    //   console.log("ipcSaga.middleware", action);
  };

  root = runSaga(
    {
      effectMiddlewares: [
        (next) => (effect) => {
          if (effect.type === effectTypes.SELECT) {
            window.electronAPI.getState().then((state) => {
              const selectorResult = effect.payload.selector(
                state,
                ...effect.payload.args,
              );
              next(selectorResult);
            });
          } else {
            return next(effect);
          }
        },
      ],
    },
    this.saga,
  );

  constructor() {
    window.electronAPI.onStateChanged(this.handleStateChanged);
    window.electronAPI.onRequestVideoCurrenTime(
      this.handleRequestVideoCurrentTime,
    );
  }

  handleStateChanged = (event: IpcRendererEvent, state: IApplicationState) => {
    // this.dispatchToSaga({
    //   type: "asdasd",
    //   payload: state,
    // });
  };

  handleRequestVideoCurrentTime = () => {};
})();
