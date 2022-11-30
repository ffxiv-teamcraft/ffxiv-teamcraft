import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromListAggregates from './list-aggregates.reducer';
import { listAggregateEntityAdapter, State } from './list-aggregates.reducer';

export const getListAggregatesState = createFeatureSelector<fromListAggregates.State>(
  fromListAggregates.listAggregatesFeatureKey
);

const { selectAll, selectEntities } = listAggregateEntityAdapter.getSelectors();

export const getListAggregatesLoaded = createSelector(
  getListAggregatesState,
  (state: State) => state.loaded
);

export const getAllListAggregates = createSelector(
  getListAggregatesState,
  (state: State) => selectAll(state)
);

export const getListAggregatesEntities = createSelector(
  getListAggregatesState,
  (state: State) => selectEntities(state)
);

export const getSelectedId = createSelector(
  getListAggregatesState,
  (state: State) => state.selectedId
);

export const getSelectedListAggregate = createSelector(
  getListAggregatesEntities,
  getSelectedId,
  (entities, selectedId) => selectedId && entities[selectedId]
);
