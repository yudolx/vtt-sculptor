import { EventEmitter } from "events";

export abstract class BaseStore<State> extends EventEmitter<{
  "did-update": [State];
}> {
  didUpdate() {
    this.emit("did-update", 12);
  }
}
