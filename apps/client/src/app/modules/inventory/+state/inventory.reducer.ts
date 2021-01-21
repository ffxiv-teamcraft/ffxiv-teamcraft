import { InventoryAction, InventoryActionTypes } from './inventory.actions';
import { UserInventory } from '../../../model/user/inventory/user-inventory';

export const INVENTORY_FEATURE_KEY = 'inventory';

export interface InventoryState {
  inventory: UserInventory,
  loaded: boolean; // has the Inventory been loaded
}

export interface InventoryPartialState {
  readonly [INVENTORY_FEATURE_KEY]: InventoryState;
}

export const initialState: InventoryState = {
  inventory: null,
  loaded: false
};

export function inventoryReducer(
  state: InventoryState = initialState,
  action: InventoryAction
): InventoryState {
  switch (action.type) {
    case InventoryActionTypes.InventoryLoaded: {
      state = {
        ...state,
        inventory: action.payload,
        loaded: true
      };
      break;
    }
    case InventoryActionTypes.UpdateInventory: {
      state = {
        ...state,
        inventory: action.payload
      };
      break;
    }
    case InventoryActionTypes.ApplyContentId: {
      state.inventory = state.inventory.clone();
      state.inventory.contentId = action.contentId;
      state = {
        ...state
      };
      break;
    }
  }
  return state;
}
