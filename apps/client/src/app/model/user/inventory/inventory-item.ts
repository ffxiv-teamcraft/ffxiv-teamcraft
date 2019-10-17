export interface InventoryItem {
  itemId: number;
  containerId: number;
  retainerName?: string;
  quantity: number;
  slot: number;
  hq: boolean;
  // Can also contain collectability for when the item can't be bound.
  spiritBond:number;
  price?: number;
}
