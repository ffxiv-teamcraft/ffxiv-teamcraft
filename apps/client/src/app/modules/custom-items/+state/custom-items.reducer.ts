import {
  CustomItemsAction,
  CustomItemsActionTypes
} from './custom-items.actions';
import { CustomItem } from '../model/custom-item';

export const CUSTOMITEMS_FEATURE_KEY = 'customItems';

export interface CustomItemsState {
  list: CustomItem[]; // list of CustomItems; analogous to a sql normalized table
  selectedId?: string; // which CustomItems record has been selected
  loaded: boolean; // has the CustomItems list been loaded
}

export interface CustomItemsPartialState {
  readonly [CUSTOMITEMS_FEATURE_KEY]: CustomItemsState;
}

export const customItemsInitialState: CustomItemsState = {
  list: [],
  loaded: false
};

export function customItemsReducer(
  state: CustomItemsState = customItemsInitialState,
  action: CustomItemsAction
): CustomItemsState {
  switch (action.type) {
    case CustomItemsActionTypes.CustomItemsLoaded: {
      state = {
        ...state,
        list: action.payload,
        loaded: true
      };
      break;
    }
  }
  return state;
}
