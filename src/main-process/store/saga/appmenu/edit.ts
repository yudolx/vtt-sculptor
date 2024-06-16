import { call, take } from "redux-saga/effects";
import type { BackgroundProcess } from "main-process/background-process";
import { IPCMainEvent, IPCRendererEvent } from "shared/constants";
import { PayloadAction } from "@reduxjs/toolkit";

/** Context menu: Edit -> New subtitle */
export function* newSubtitle(application: BackgroundProcess) {
  application.window.main.webContents.send(
    IPCMainEvent.RequestVideoCurentTime().type,
  );

  const currentVideoTimeAction: PayloadAction<number> = yield take(
    IPCRendererEvent.VideoCurrentTime,
  );
}
