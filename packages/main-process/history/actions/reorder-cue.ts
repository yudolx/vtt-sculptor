import { UndoableAction, redo, undo, UndoableActionState } from "./action";

export class ReorderCueAction implements UndoableAction {
  public state = UndoableActionState.Undoable;

  constructor(
    public index: number,
    public overIndex: number,
    protected options: {
      reorder: (index: number, overIndex: number) => void;
    },
  ) {}

  @undo
  undo(): void {
    this.options.reorder(this.overIndex, this.index);
  }

  @redo
  redo(): void {
    this.options.reorder(this.index, this.overIndex);
  }
}
