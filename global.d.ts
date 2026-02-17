import { PRELOAD_GLOBAL_KEY } from "@sculptor/helpers/constants";
import { EmitIPCEvent } from "@sculptor/helpers/preload";

declare module "*.css";

declare global {
  const __APP_NAME__: string;
  const __DEVELOPMENT__: boolean;

  // global fix for electronAPI types
  interface Window {
    [PRELOAD_GLOBAL_KEY]: typeof EmitIPCEvent;
  }
}
