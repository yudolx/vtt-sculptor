import { contextBridge } from "electron";
import { PRELOAD_GLOBAL_KEY } from "shared/constants";
import { EmitIPCEvent } from "shared/preload";

contextBridge.exposeInMainWorld(PRELOAD_GLOBAL_KEY, {
  ...EmitIPCEvent,
});
