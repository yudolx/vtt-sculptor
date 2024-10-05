/* eslint-disable @typescript-eslint/no-namespace */
import { IpcMainEvent, IpcMainInvokeEvent, IpcRendererEvent } from "electron";
import { IApplicationState } from "main-process/store";
import { IVTTCue } from "./libs/vtt/vttcue";

export type ExtractArgs<EvMap, Key> = Key extends keyof EvMap
  ? EvMap[Key] extends [infer Arg, any?]
    ? unknown extends Arg
      ? []
      : [Arg]
    : EvMap[Key] extends []
      ? []
      : never
  : never;

export type ExtractInvoke<EvMap, Key> = Key extends keyof EvMap
  ? EvMap[Key] extends [any, infer Invoke]
    ? Invoke
    : EvMap[Key] extends []
      ? any
      : never
  : never;

type EventMap<T> = Record<keyof T, [any?, any?]>;
type Key<K, T> = K | keyof T;

/* eslint-disable prettier/prettier */
// interface TypedIpcRenderer<E extends EventMap<E>> extends NodeJS.EventEmitter {
//   addListener<K>(channel: Key<K, E>, listener: (event: IpcRendererEvent, ...arg: ExtractArgs<E, K>) => void): this;
//   invoke<K>(channel: Key<K, E>, ...arg: ExtractArgs<E, K>): Promise<ExtractInvoke<E, K>>;
//   off<K>(channel: Key<K, E>, listener: (event: IpcRendererEvent, ...arg: ExtractArgs<E, K>) => void): this;
//   on<K>(channel: Key<K, E>, listener: (event: IpcRendererEvent, ...arg: ExtractArgs<E, K>) => void): this;
//   once<K>(channel: Key<K, E>, listener: (event: IpcRendererEvent, ...arg: ExtractArgs<E, K>) => void): this;
//   postMessage<K>(channel: Key<K, E>, message: any, transfer?: MessagePort[]): void;
//   removeAllListeners<K>(channel: Key<K, E>): this;
//   removeListener<K>(channel: Key<K, E>, listener: (event: IpcRendererEvent, ...arg: ExtractArgs<E, K>) => void): this;
//   send<K>(channel: Key<K, E>, ...arg: ExtractArgs<E, K>): void;
//   sendSync<K>(channel: Key<K, E>, ...arg: ExtractArgs<E, K>): any;
//   sendToHost<K>(channel: Key<K, E>, ...arg: ExtractArgs<E, K>): void;
// }

/* eslint-disable prettier/prettier */
// interface TypedIpcMain<E extends EventMap<E>> extends NodeJS.EventEmitter {
//   handle<K>(channel: Key<K, E>, listener: (event: IpcMainInvokeEvent, ...args: ExtractArgs<E, K>) => (Promise<ExtractInvoke<E, K>>) | (ExtractInvoke<E, K>)): void;
//   handleOnce<K>(channel: Key<K, E>, listener: (event: IpcMainInvokeEvent, ...args: ExtractArgs<E, K>) => (Promise<ExtractInvoke<E, K>>) | (ExtractInvoke<E, K>)): void;
//   on<K>(channel: Key<K, E>, listener: (event: IpcMainEvent, ...args: ExtractArgs<E, K>) => void): this;
//   once<K>(channel: Key<K, E>, listener: (event: IpcMainEvent, ...args: ExtractArgs<E, K>) => void): this;
//   removeAllListeners<K>(channel?: Key<K, E>): this;
//   removeHandler<K>(channel: Key<K, E>): void;
//   removeListener<K>(channel: Key<K, E>, listener: (...args: ExtractArgs<E, K>) => void): this;
// }
/* eslint-enable prettier/prettier */

export type ApplicationEventMap = {
  "ipc/main/state-changed": [IApplicationState];
  "ipc/main/request-video-current-time": [{ uuid: string }];
  "ipc/renderer/video-current-time": [number];
  "ipc/renderer/get-state": [unknown, IApplicationState];
  "ipc/renderer/cues-changed": [IVTTCue[]];
};

// declare module "electron" {
// namespace Electron {
//   export type IpcRenderer = TypedIpcRenderer<ApplicationEventMap>;
//   export type IpcMain = TypedIpcMain<ApplicationEventMap>;
// }
// }
