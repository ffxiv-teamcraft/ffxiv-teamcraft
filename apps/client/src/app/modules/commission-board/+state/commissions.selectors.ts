import { createFeatureSelector, createSelector } from '@ngrx/store';
import { COMMISSIONS_FEATURE_KEY, CommissionsPartialState, State } from './commissions.reducer';

// Lookup the 'Commissions' feature state managed by NgRx
export const getCommissionsState = createFeatureSelector<
  State>(COMMISSIONS_FEATURE_KEY);

export const getCommissionsLoaded = createSelector(
  getCommissionsState,
  (state: State) => state.loaded
);

export const getAllCommissions = createSelector(
  getCommissionsState,
  (state: State) => state.commissions
);

export const getSelectedId = createSelector(
  getCommissionsState,
  (state: State) => state.selectedId
);

export const getSelected = createSelector(
  getAllCommissions,
  getSelectedId,
  (commissions, selectedId) => selectedId && commissions.find(c => c.$key === selectedId)
);
