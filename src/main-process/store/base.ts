import { IpcMainEvent } from "electron";

export abstract class BaseStore<State> {
  /** This method should return true if state has changed and false if it hasn't */
  public async onDispatch(
    event: IpcMainEvent,
    payload: IPCDispatchPayload,
  ): Promise<boolean> {
    switch (payload.action) {
      case IPCRendererEvent.GetState: {
        return true;
      }
      default:
        return false;
    }
  }

  public getState(): Promise<State> {
    throw new Error("Not implemented");
  }
}
