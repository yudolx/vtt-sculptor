import { ipcMain, ipcRenderer } from "electron";
import { eventChannel } from "redux-saga";
import { take, put, fork } from "typed-redux-saga";
import { IPCMainEvent } from "shared/constants";
import { PayloadAction } from "@reduxjs/toolkit";

const ipcChannel = eventChannel<PayloadAction<any>>((emitter) => {
  const handler = function (
    handlerEvent: Electron.IpcRendererEvent,
    handlerPayload: PayloadAction,
  ) {
    emitter({
      type: IPCMainEvent.dispatch.type,
      payload: handlerPayload,
    });
  };

  ipcRenderer.on(IPCMainEvent.dispatch.type, handler);

  return function () {
    ipcRenderer.off(IPCMainEvent.dispatch.type, handler);
  };
});

function* ipcRendererWatcher() {
  while (true) {
    const action = yield* take(ipcChannel);
    yield* put(action);
  }
}

export function* ipcRendererSaga() {
  yield fork(ipcRendererWatcher);
}
