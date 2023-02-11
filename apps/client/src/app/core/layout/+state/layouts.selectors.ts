import { createFeatureSelector, createSelector } from '@ngrx/store';
import { LayoutsState, LIST_LAYOUTS_FEATURE_KEY, listLayoutsAdapter } from './layouts.reducer';

// Lookup the 'Layouts' feature state managed by NgRx
const getLayoutsState = createFeatureSelector<LayoutsState>(LIST_LAYOUTS_FEATURE_KEY);

const { selectAll, selectEntities } = listLayoutsAdapter.getSelectors();

export const getLoaded = createSelector(
  getLayoutsState,
  (state: LayoutsState) => state.loaded
);

export const getAllLayouts = createSelector(
  getLayoutsState,
  getLoaded,
  (state: LayoutsState, isLoaded) => {
    return isLoaded ? selectAll(state) : [];
  }
);

export const getLayoutsEntities = createSelector(
  getLayoutsState,
  state => selectEntities(state)
);

export const getSelectedId = createSelector(
  getLayoutsState,
  (state: LayoutsState) => state.selectedId
);

export const getSelectedLayout = createSelector(
  getLayoutsEntities,
  getSelectedId,
  (layouts, id) => {
    return layouts[id];
  }
);
