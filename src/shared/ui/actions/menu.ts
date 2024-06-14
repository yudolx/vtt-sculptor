import { createAction } from "@reduxjs/toolkit";

export const menu = {
  file: {
    new: createAction("menu/file/new"),
    open: createAction("menu/file/open"),
  },
  edit: {
    newSubtitle: createAction("menu/edit/newsubtitle"),
  },
  video: {
    load: createAction("menu/video/load"),
  },
};
