import { assert } from "@sculptor/helpers/assert";

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

    for (let i = lastClickedCueIndex + 1; i < this.items.length; i++) {
      const condition = selectedArg
        ? !this.selected.has(this.items[i])
        : this.selected.has(this.items[i]);

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

    for (let i = lastClickedItemIndex - 1; i >= 0; i--) {
      const condition = selectedArg
        ? !this.selected.has(this.items[i])
        : this.selected.has(this.items[i]);

      if (condition) {
        return this.items[i];
      }
    }

    throw new Error("No prev inactive item found");
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
        if (!this.lastClickedItem) {
          this.lastClickedItem = this.items[0];
        }

        const previousRowIndex = this.items.indexOf(this.lastClickedItem);
        const nextRowIndex =
          modifiers.key === "ArrowDown"
            ? Math.min(previousRowIndex + 1, this.items.length - 1)
            : Math.max(previousRowIndex - 1, 0);

        const nextRow = this.items.at(nextRowIndex)!;
        const isNextRowSelected = this.selected.has(nextRow);

        if (nextRowIndex > previousRowIndex) {
          if (isNextRowSelected) {
            // We are navigating to the bottom of the page and removing selected rows
            this.selected.delete(this.lastClickedItem);
            this.lastClickedItem = nextRow;
          } else {
            // We are navigating to the bottom of the page and adding selected rows
            this.selected.add(nextRow);
            this.lastClickedItem = nextRow;
          }
        } else {
          if (isNextRowSelected) {
            // We are navigating to the top of the page and removing selected rows
            this.selected.delete(this.lastClickedItem);
            this.lastClickedItem = nextRow;
          } else {
            // We are navigating to the top of the page and adding selected rows
            this.selected.add(nextRow);
            this.lastClickedItem = nextRow;
          }
        }
      } else if (modifiers.key === "ArrowDown" || modifiers.key === "ArrowUp") {
        const selectedArr = [...this.selected];
        const fromItem =
          this.lastClickedItem ??
          selectedArr[selectedArr.length - 1] ??
          this.items.at(0);

        assert(fromItem, 'No "from" item found');
        const fromItemIndex = this.items.indexOf(fromItem);
        assert(fromItemIndex !== -1, 'No "from" item found');

        let nextItemIndex: number;

        if (modifiers.key === "ArrowDown") {
          nextItemIndex = Math.min(fromItemIndex + 1, this.items.length - 1);
        } else if (modifiers.key === "ArrowUp") {
          nextItemIndex = Math.max(fromItemIndex - 1, 0);
        } else {
          throw new Error();
        }

        const nextItem = this.items.at(nextItemIndex);

        assert(nextItem, "Next item not found");

        this.selected.clear();
        this.selected.add(nextItem);
        this.lastClickedItem = nextItem;
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
