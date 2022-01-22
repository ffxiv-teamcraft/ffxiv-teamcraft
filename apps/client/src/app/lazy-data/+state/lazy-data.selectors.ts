import { createFeatureSelector, createSelector } from '@ngrx/store';
import { LAZY_DATA_FEATURE_KEY, LazyDataPartialState, State } from './lazy-data.reducer';

// Lookup the 'LazyData' feature state managed by NgRx
export const getLazyDataState = createFeatureSelector<
  State>(LAZY_DATA_FEATURE_KEY);

export const getEntry = createSelector(
  getLazyDataState,
  (state, { key }) => state.data[key]
);

export const getEntryRow = createSelector(
  getLazyDataState,
  (state, { key, id }) => {
    const entry = state.data[key];
    if (entry) {
      return entry[id];
    }
    return undefined;
  }
);

export const getEntryStatus = createSelector(
  getLazyDataState,
  (state, { key }) => state.loadingStates[key]
);

export const isLoading = createSelector(
  getLazyDataState,
  state => {
    // If debugging loading states, uncomment the line below
    // console.log(state.loadingEntries);
    return state.loadingEntries.length > 0;
  }
);
