import { createAction } from "@reduxjs/toolkit";
import type { BackgroundProcess } from "main-process/background-process";

export const backgroundProcessStarted = createAction<BackgroundProcess>(
  "core/backgroundProcessStarted",
);
