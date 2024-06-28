import { EventEmitter } from "node:events";

export abstract class BaseStore<State> {
  constructor(
    protected updateEmitter: EventEmitter<{ "did-update": [State] }>,
  ) {}

  public getState(): State {
    throw new Error("Not implemented");
  }

  protected emitUpdate() {
    this.updateEmitter.emit("did-update", this.getState());
  }
}
