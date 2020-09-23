import { createFeatureSelector, createSelector } from '@ngrx/store';
import {
  COMMISSIONS_FEATURE_KEY,
  State,
  CommissionsPartialState,
  commissionsAdapter,
} from './commissions.reducer';

// Lookup the 'Commissions' feature state managed by NgRx
export const getCommissionsState = createFeatureSelector<
  CommissionsPartialState,
  State
>(COMMISSIONS_FEATURE_KEY);

const { selectAll, selectEntities } = commissionsAdapter.getSelectors();

export const getCommissionsLoaded = createSelector(
  getCommissionsState,
  (state: State) => state.loaded
);

export const getAllCommissions = createSelector(
  getCommissionsState,
  (state: State) => selectAll(state)
);

export const getCommissionsEntities = createSelector(
  getCommissionsState,
  (state: State) => selectEntities(state)
);

export const getSelectedId = createSelector(
  getCommissionsState,
  (state: State) => state.selectedId
);

export const getSelected = createSelector(
  getCommissionsEntities,
  getSelectedId,
  (entities, selectedId) => selectedId && entities[selectedId]
);
