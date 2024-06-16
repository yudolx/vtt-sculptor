import { Action, PayloadAction } from "@reduxjs/toolkit";
import { ipcRenderer } from "electron";
import { safeHasOwnProperty } from "./safeHasOwnProperty";

export const sendFromRenderer = (action: Action | PayloadAction) => {
  if (safeHasOwnProperty(action, "payload")) {
    ipcRenderer.send(action.type, action.payload);
  } else {
    ipcRenderer.send(action.type);
  }
};

export const invokeFromRenderer = (action: Action | PayloadAction) => {
  if (safeHasOwnProperty(action, "payload")) {
    return ipcRenderer.invoke(action.type, action.payload);
  } else {
    return ipcRenderer.invoke(action.type);
  }
};
