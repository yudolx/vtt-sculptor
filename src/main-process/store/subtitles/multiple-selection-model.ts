import { assert } from "shared/assert";

export interface IAlterationModifiersPayload {
  shiftKey: boolean;
  ctrlKey: boolean;
  key?: "ArrowUp" | "ArrowDown";
}

export class MultipleSelectionModel<Q> {
  protected lastClickedItem: Q | null = null;

  protected selected: Set<Q> = new Set();

  constructor(protected items: Q[]) {}

  public setItems(itemsArg: Q[], selected?: Q[]) {
    this.items = itemsArg;
    if (selected) {
      this.selected = new Set(selected);
    }
  }

  public getSelected() {
    return [...this.selected];
  }

  protected seekNext(selectedArg = false) {
    assert(this.lastClickedItem, "No last clicked item is set");
    const lastClickedCueIndex = this.items.indexOf(this.lastClickedItem);

    if (lastClickedCueIndex === this.items.length - 1) {
      return this.lastClickedItem;
    }

    for (let i = lastClickedCueIndex; i < this.items.length; i++) {
      const condition = selectedArg
        ? this.selected.has(this.items[i])
        : !this.selected.has(this.items[i]);

      if (condition) {
        return this.items[i];
      }
    }

    throw new Error("No next inactive item found");
  }

  protected seekPrev(selectedArg = false) {
    assert(this.lastClickedItem, "No last clicked item is set");
    const lastClickedItemIndex = this.items.indexOf(this.lastClickedItem);

    if (lastClickedItemIndex === 0) {
      return this.lastClickedItem;
    }

    for (let i = 0; i < lastClickedItemIndex; i++) {
      const condition = selectedArg
        ? this.selected.has(this.items[i])
        : !this.selected.has(this.items[i]);

      if (condition) {
        return this.items[i];
      }
    }

    throw new Error("No next inactive item found");
  }

  protected toggleSelected(item: Q) {
    if (this.selected.has(item)) {
      this.selected.delete(item);
      return false;
    } else {
      this.selected.add(item);
      return true;
    }
  }

  public setSelectionRaw(items: Q[]) {
    this.selected = new Set(items);
  }

  public addSelection(item: Q) {
    this.selected.add(item);
  }

  public removeSelection(item: Q) {
    this.selected.delete(item);
  }

  public size() {
    return this.selected.size;
  }

  public alterSelection(
    targetArg: Q | null,
    modifiers: IAlterationModifiersPayload,
  ): Set<Q> {
    if (targetArg) {
      const targetIndex = this.items.indexOf(targetArg);
      assert(targetIndex !== -1, "Provided item does not exist");

      const isTargetSelected = this.selected.has(targetArg);

      if (!this.lastClickedItem || isSingleClick(modifiers)) {
        this.selected.clear();
        this.lastClickedItem = targetArg;
        this.toggleSelected(targetArg);
        return this.selected;
      }

      if (isClick(modifiers)) {
        if (modifiers.ctrlKey) {
          this.lastClickedItem = targetArg;
          this.toggleSelected(targetArg);

          return this.selected;
        } else if (modifiers.shiftKey) {
          const lastClickedItemIndex = this.items.indexOf(this.lastClickedItem);
          for (
            let i = Math.min(targetIndex, lastClickedItemIndex);
            i <= Math.max(targetIndex, lastClickedItemIndex);
            i++
          ) {
            if (isTargetSelected) {
              this.selected.delete(this.items[i]);
            } else {
              this.selected.add(this.items[i]);
            }
          }

          return this.selected;
        }
      }
    } else {
      if (modifiers.shiftKey) {
        if (modifiers.key === "ArrowDown") {
          const next = this.seekNext();
          const isNextSelected = this.selected.has(next);
          if (isNextSelected) {
            this.selected.delete(next);
          } else {
            this.selected.add(next);
          }
          this.lastClickedItem = next;
        } else if (modifiers.key === "ArrowUp") {
          const prev = this.seekPrev();
          const isPrevSelected = this.selected.has(prev);
          if (isPrevSelected) {
            this.selected.delete(prev);
          } else {
            this.selected.add(prev);
          }
          this.lastClickedItem = prev;
        }
      }

      return this.selected;
    }

    throw new Error("Unexpected error");
  }
}

const isSingleClick = (modifiers: IAlterationModifiersPayload) => {
  return !modifiers.ctrlKey && !modifiers.shiftKey && isClick(modifiers);
};

const isClick = (modifiers: IAlterationModifiersPayload) => {
  return !modifiers.key;
};
