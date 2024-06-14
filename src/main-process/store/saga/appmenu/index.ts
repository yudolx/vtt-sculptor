import { call, takeLeading as leading } from "redux-saga/effects";
import { menu } from "shared/ui/actions/menu";
import { newfile, openFile } from "./file";
import { loadVideo } from "./video";
import { newSubtitle } from "./edit";
import type { BackgroundProcess } from "main-process/background-process";

export function* appmenu(application: BackgroundProcess) {
  yield leading(menu.file.new.type, function* () {
    yield call(newfile, application);
  });
  yield leading(menu.file.open.type, function* () {
    yield call(openFile, application);
  });
  yield leading(menu.video.load.type, function* () {
    yield call(loadVideo, application);
  });
  yield leading(menu.edit.newSubtitle.type, function* () {
    yield call(newSubtitle, application);
  });
}
