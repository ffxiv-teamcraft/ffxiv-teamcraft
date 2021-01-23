import { Action } from '@ngrx/store';
import { UserInventory } from '../../../model/user/inventory/user-inventory';

export enum InventoryActionTypes {
  LoadInventory = '[Inventory] Load Inventory',
  InventoryLoaded = '[Inventory] Inventory Loaded',
  UpdateInventory = '[Inventory] Update Inventory',
  ResetInventory = '[Inventory] Reset Inventory',
  SetContentId = '[Inventory] Set Content ID',
  ApplyContentId = '[Inventory] Apply Content ID',
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

export class SetContentId implements Action {
  readonly type = InventoryActionTypes.SetContentId;

  constructor(public readonly contentId: string) {
  }
}

export class ApplyContentId implements Action {
  readonly type = InventoryActionTypes.ApplyContentId;

  constructor(public readonly contentId: string) {
  }
}

export type InventoryAction =
  | LoadInventory
  | InventoryLoaded
  | UpdateInventory
  | ResetInventory
  | SetContentId
  | ApplyContentId;
