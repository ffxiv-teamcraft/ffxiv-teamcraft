import { createFeatureSelector, createSelector } from '@ngrx/store';
import {
  CUSTOMITEMS_FEATURE_KEY,
  CustomItemsState
} from './custom-items.reducer';

// Lookup the 'CustomItems' feature state managed by NgRx
const getCustomItemsState = createFeatureSelector<CustomItemsState>(
  CUSTOMITEMS_FEATURE_KEY
);

const getLoaded = createSelector(
  getCustomItemsState,
  (state: CustomItemsState) => state.loaded
);

const getAllCustomItems = createSelector(
  getCustomItemsState,
  getLoaded,
  (state: CustomItemsState, isLoaded) => {
    return isLoaded ? state.list : [];
  }
);
const getSelectedId = createSelector(
  getCustomItemsState,
  (state: CustomItemsState) => state.selectedId
);
const getSelectedCustomItems = createSelector(
  getAllCustomItems,
  getSelectedId,
  (customItems, id) => {
    return customItems.find(it => it.$key === id);
  }
);

export const customItemsQuery = {
  getLoaded,
  getAllCustomItems,
  getSelectedCustomItems
};
