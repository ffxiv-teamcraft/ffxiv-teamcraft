export interface InventoryPatch {
  itemId: number;
  quantity: number;
  hq: boolean;
  containerId: number;
  spiritBond?: number;
}
