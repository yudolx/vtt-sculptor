import { BaseStore } from "../base";

export interface IVideoStoreState {
  path: string | null;
}

export class VideoStore extends BaseStore<IVideoStoreState> {
  protected path: string | null = null;

  public async onDispatch(action: string, payload: IPCDispatchPayload) {
    switch (action) {
      case "get-state": {
        return true;
      }
    }
  }

  public async getState() {
    return { path: this.path };
  }
}
