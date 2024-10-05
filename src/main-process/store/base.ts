import { ApplicationEventMap, ExtractArgs } from "shared/electron";

export abstract class BaseStore<State> {
  /** This method should return true if state has changed and false if it hasn't */
  public async onDispatch<K extends keyof ApplicationEventMap>(
    action: K,
    ...__args: any[]
  ): Promise<boolean> {
    switch (action) {
      case "ipc/renderer/get-state": {
        return true;
      }
      default:
        return false;
    }
  }

  public getState(): State {
    throw new Error("Not implemented");
  }
}

export function cast<K extends keyof ApplicationEventMap, KK>(
  action1: K,
  action2: KK,
  payloadArgs: unknown[],
): payloadArgs is ExtractArgs<ApplicationEventMap, K> {
  // @ts-expect-error
  return action1 === action2;
}
