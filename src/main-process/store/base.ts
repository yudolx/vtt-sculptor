import { EventEmitter } from "node:events";

export abstract class BaseStore<K extends string, State> {
  constructor(
    protected key: K,
    protected updateEmitter: EventEmitter<{ "did-update": [Record<K, State>] }>,
  ) {}

  public getState(): State {
    throw new Error("Not implemented");
  }

  protected emitUpdate() {
    // @ts-expect-error
    this.updateEmitter.emit("did-update", { [this.key]: this.getState() });
  }
}
