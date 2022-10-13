import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CUSTOMITEMS_FEATURE_KEY, CustomItemsState } from './custom-items.reducer';

// Lookup the 'CustomItems' feature state managed by NgRx
const getCustomItemsState = createFeatureSelector<CustomItemsState>(
  CUSTOMITEMS_FEATURE_KEY
);

const getLoaded = createSelector(
  getCustomItemsState,
  (state: CustomItemsState) => {
    
    return state.loaded;
  }
);

const getAllCustomItems = createSelector(
  getCustomItemsState,
  getLoaded,
  (state: CustomItemsState, isLoaded) => {
    return isLoaded ? state.list : [];
  }
);
const getFoldersLoaded = createSelector(
  getCustomItemsState,
  (state: CustomItemsState) => state.foldersLoaded
);

const getAllCustomItemFolders = createSelector(
  getCustomItemsState,
  getLoaded,
  (state: CustomItemsState, isLoaded) => {
    return isLoaded ? state.folders : [];
  }
);

export const customItemsQuery = {
  getLoaded,
  getAllCustomItems,
  getFoldersLoaded,
  getAllCustomItemFolders
};
