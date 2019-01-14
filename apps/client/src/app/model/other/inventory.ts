export class Inventory {

  private static INVENTORY_PANEL_SIZE = 35;

  private grid: { id: number, icon: number, amount: number }[] = new Array(Inventory.INVENTORY_PANEL_SIZE);

  private nextFreeSlot = 0;

  public get content(): { id: number, icon: number, amount: number }[] {
    return this.grid;
  }

  add(id: number, icon: number, amount: number): void {
    if (amount === 0) {
      return;
    }
    const usedSlots = this.grid.filter(slot => slot !== undefined).length;
    if (usedSlots > 0 && usedSlots % 35 === 0) {
      this.grid.push(...new Array(Inventory.INVENTORY_PANEL_SIZE));
    }
    const stackSize = 999;
    const stacks = Math.ceil(amount / stackSize);
    for (let stack = 1; stack <= stacks; stack++) {
      let stackAmount = stackSize;
      // If it's the last stack, get the remaining items.
      if (stack === stacks) {
        stackAmount = amount % stackSize;
      }
      this.grid[this.nextFreeSlot] = { id: id, icon: icon, amount: stackAmount };
      this.nextFreeSlot++;
    }
  }

  getDisplay(): { id: number, icon: number, amount: number }[][] {
    const display = [];
    const grid = [...this.grid].sort((a, b) => {
      if (a.id === b.id) {
        // If it's the same item, order by amount DESC
        return b.amount - a.amount;
      }
      return a.id - b.id;
    });
    while (grid.length) {
      display.push(grid.splice(0, 35));
    }
    return display;
  }
}
