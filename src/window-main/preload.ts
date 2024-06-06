import { contextBridge } from "electron";
import { EmitIPCEvent, PRELOAD_GLOBAL_KEY } from "shared/preload";

contextBridge.exposeInMainWorld(PRELOAD_GLOBAL_KEY, {
  ...EmitIPCEvent,
});
