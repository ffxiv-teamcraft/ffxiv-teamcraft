import { Action } from '@ngrx/store';
import { UserInventory } from '../../../model/user/inventory/user-inventory';

export enum InventoryActionTypes {
  LoadInventory = '[Inventory] Load Inventory',
  InventoryLoaded = '[Inventory] Inventory Loaded',
  UpdateInventory = '[Inventory] Update Inventory',
  ResetInventory = '[Inventory] Reset Inventory',
}

export class LoadInventory implements Action {
  readonly type = InventoryActionTypes.LoadInventory;
}

export class InventoryLoaded implements Action {
  readonly type = InventoryActionTypes.InventoryLoaded;

  constructor(public payload: UserInventory) {
  }
}

export class UpdateInventory implements Action {
  readonly type = InventoryActionTypes.UpdateInventory;

  constructor(public payload: UserInventory, public force = false) {
  }
}

export class ResetInventory implements Action {
  readonly type = InventoryActionTypes.ResetInventory;
}

export type InventoryAction =
  | LoadInventory
  | InventoryLoaded
  | UpdateInventory
  | ResetInventory;
