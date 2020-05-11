export interface InventoryPatch {
  itemId: number;
  quantity: number;
  hq: boolean;
  containerId: number;
  retainerName?: string;
  spiritBond?: number;
  emptied?: boolean;
  moved?: boolean;
}
