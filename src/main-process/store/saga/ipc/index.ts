import { ipcMain } from "electron";
import { eventChannel } from "redux-saga";
import { take, put, fork } from "typed-redux-saga";
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

  const unsub = Object.values(IPCRendererEvent).map((actionCreator) => {
    const dispose = subscribe(actionCreator.type);
    return dispose;
  });

  return function () {
    unsub.forEach((invoke) => invoke());
  };
});

function* ipcWatcher() {
  while (true) {
    const action = yield* take(ipcChannel);
    // @ts-expect-error
    yield* put(action);
  }
}

export function* ipc() {
  yield fork(ipcWatcher);
}
