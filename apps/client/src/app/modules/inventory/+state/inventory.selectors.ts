import { createFeatureSelector, createSelector } from '@ngrx/store';
import { INVENTORY_FEATURE_KEY, InventoryState } from './inventory.reducer';

// Lookup the 'Inventory' feature state managed by NgRx
const getInventoryState = createFeatureSelector<InventoryState>(
  INVENTORY_FEATURE_KEY
);

const getLoaded = createSelector(
  getInventoryState,
  (state: InventoryState) => state.loaded
);

const getInventory = createSelector(
  getInventoryState,
  (state) => {
    return state.inventory;
  }
);

export const inventoryQuery = {
  getLoaded,
  getInventory
};
