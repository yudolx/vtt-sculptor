import { ipcMain } from "electron";
import { eventChannel } from "redux-saga";
import { take, put, fork } from "redux-saga/effects";
import { IPCRendererEvent } from "shared/constants";

const ipcChannel = eventChannel((emitter) => {
  function subscribe(event: string) {
    function handler(handlerEvent: Electron.IpcMainEvent, handlerPayload: any) {
      emitter({
        type: event,
        payload: handlerPayload,
      });
    }

    ipcMain.on(event, handler);

    return () => {
      ipcMain.off(event, handler);
    };
  }

  const unsub = [
    subscribe(IPCRendererEvent.CuesChanged),
    subscribe(IPCRendererEvent.VideoCurrentTime),
  ];

  return function () {
    unsub.forEach((invoke) => invoke());
  };
});

function* ipcWatcher() {
  while (true) {
    // @ts-expect-error
    const payload = yield take(ipcChannel);
    yield put(payload);
  }
}

export function* ipc() {
  yield fork(ipcWatcher);
}
