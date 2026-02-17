import { assert } from "@sculptor/helpers/assert";

export enum UndoableActionState {
  Undoable,
  Redoable,
}

export interface UndoableAction {
  state: UndoableActionState;
  undo(): void;
  redo(): void;
}

export function redo(
  target: UndoableAction,
  propertyKey: string,
  descriptor: PropertyDescriptor,
) {
  const originalMethod = descriptor.value;
  descriptor.value = function (this: UndoableAction, ...args: any[]) {
    assert(
      this.state === UndoableActionState.Redoable,
      `[redo] The action is already redone`,
    );
    const result = originalMethod.apply(this, args);

    this.state = UndoableActionState.Undoable;

    return result;
  };
  return descriptor;
}

export function undo(
  target: UndoableAction,
  propertyKey: string,
  descriptor: PropertyDescriptor,
) {
  const originalMethod = descriptor.value;
  descriptor.value = function (this: UndoableAction, ...args: any[]) {
    assert(
      this.state === UndoableActionState.Undoable,
      "[undo] The is already undone",
    );
    const result = originalMethod.apply(this, args);

    this.state = UndoableActionState.Redoable;

    return result;
  };
  return descriptor;
}
