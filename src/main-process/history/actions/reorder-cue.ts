import { IUndoableAction, UndoableActionState } from "./action";
import { assert } from "shared/assert";

export class ReorderCueAction implements IUndoableAction {
  public state = UndoableActionState.Undoable;

  constructor(
    public index: number,
    public overIndex: number,
    protected options: {
      reorder: (index: number, overIndex: number) => void;
    },
  ) {}

  undo(): void {
    assert(
      this.state === UndoableActionState.Undoable,
      `[undo}] The aciton can not be undone`,
    );
    this.options.reorder(this.overIndex, this.index);
    this.state = UndoableActionState.Redoable;
  }

  redo(): void {
    assert(
      this.state === UndoableActionState.Redoable,
      `[redo}] The aciton can not be redone`,
    );

    this.options.reorder(this.index, this.overIndex);
    this.state = UndoableActionState.Undoable;
  }
}
