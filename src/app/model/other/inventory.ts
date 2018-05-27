export class Inventory {

    private static INTENTORY_SIZE = 140;

    private grid: { id: number, icon: number, amount: number }[] = new Array(Inventory.INTENTORY_SIZE);

    private nextFreeSlot = 0;

    public get content(): { id: number, icon: number, amount: number }[] {
        return this.grid;
    }

    add(id: number, icon: number, amount: number): void {
        if (this.isFull()) {
            return;
        }
        const stackSize = 999;
        const stacks = Math.ceil(amount / stackSize);
        for (let stack = 1; stack <= stacks; stack++) {
            let stackAmount = stackSize;
            // If it's the last stack, get the remaining items.
            if (stack === stacks) {
                stackAmount = amount % stackSize;
            }
            this.grid[this.nextFreeSlot] = {id: id, icon: icon, amount: stackAmount};
            this.nextFreeSlot++;
        }
    }

    public isFull(): boolean {
        return this.nextFreeSlot >= Inventory.INTENTORY_SIZE + 1;
    }

    getDisplay(): { id: number, icon: number, amount: number }[][] {
        return [this.grid.slice(0, 35),
                this.grid.slice(35, 70),
                this.grid.slice(70, 105),
                this.grid.slice(105, Inventory.INTENTORY_SIZE)];
    }
}
