import { createFeatureSelector, createSelector } from '@ngrx/store';
import { DIRTY_FEATURE_KEY, DirtyState } from './dirty.reducer';

// Lookup the 'Dirty' feature state managed by NgRx
const getDirtyState = createFeatureSelector<DirtyState>(DIRTY_FEATURE_KEY);

const getAllDirty = createSelector(
  getDirtyState,
  (state: DirtyState) => {
    return state.entries;
  }
);

export const dirtyQuery = {
  getAllDirty
};
