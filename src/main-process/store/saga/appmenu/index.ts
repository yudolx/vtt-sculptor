import { takeEvery as every } from "redux-saga/effects";
import { menu } from "shared/ui/actions/menu";
import { newfile, openFile } from "./file";
import { loadVideo } from "./video";

export function* appmenu() {
  yield every(menu.file.new, newfile);
  yield every(menu.file.open, openFile);
  yield every(menu.video.load, loadVideo);
}
