/* eslint-disable @typescript-eslint/no-var-requires */
import { contextBridge } from "electron";
import { PRELOAD_GLOBAL_KEY } from "@sculptor/helpers/constants";
import { EmitIPCEvent } from "@sculptor/helpers/preload";

contextBridge.exposeInMainWorld(PRELOAD_GLOBAL_KEY, {
  ...EmitIPCEvent,
});
