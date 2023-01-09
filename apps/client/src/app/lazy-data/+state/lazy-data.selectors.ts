import { createFeatureSelector, createSelector } from '@ngrx/store';
import { LAZY_DATA_FEATURE_KEY, State } from './lazy-data.reducer';
import { LazyDataKey } from '../lazy-data-types';

// Lookup the 'LazyData' feature state managed by NgRx
export const getLazyDataState = createFeatureSelector<State>(LAZY_DATA_FEATURE_KEY);

export const getEntry = (key: LazyDataKey) => createSelector(
  getLazyDataState,
  (state) => state.data[key]
);

export const getEntryRow = ({ key, id }) => createSelector(
  getLazyDataState,
  (state) => {
    const entry = state.data[key];
    if (entry) {
      return entry[id];
    }
    return undefined;
  }
);

export const getEntryStatus = ({ key }) => createSelector(
  getLazyDataState,
  (state) => state.loadingStates[key]
);

export const isLoading = createSelector(
  getLazyDataState,
  state => {
    // If debugging loading states, uncomment the line below
    // console.log(state.loadingEntries);
    return state.loadingEntries.length > 0;
  }
);
