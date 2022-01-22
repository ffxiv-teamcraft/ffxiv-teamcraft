import { createFeatureSelector, createSelector } from '@ngrx/store';
import { METRICSDASHBOARDS_FEATURE_KEY, metricsDashboardsAdapter, MetricsDashboardsPartialState, State } from './metrics-dashboards.reducer';
import { MetricsDashboardLayout } from '../display/metrics-dashboard-layout';

// Lookup the 'MetricsDashboards' feature state managed by NgRx
export const getMetricsDashboardsState = createFeatureSelector<
  State>(METRICSDASHBOARDS_FEATURE_KEY);

const { selectAll, selectEntities } = metricsDashboardsAdapter.getSelectors();

export const getMetricsDashboardsLoaded = createSelector(
  getMetricsDashboardsState,
  (state: State) => state.loaded
);

export const getAllMetricsDashboards = createSelector(
  getMetricsDashboardsState,
  (state: State) => [...selectAll(state), MetricsDashboardLayout.DEFAULT]
);

export const getMetricsDashboardsEntities = createSelector(
  getMetricsDashboardsState,
  (state: State) => selectEntities(state)
);

export const getSelectedId = createSelector(
  getMetricsDashboardsState,
  (state: State) => state.selectedId
);

export const getSelected = createSelector(
  getMetricsDashboardsEntities,
  getSelectedId,
  (entities, selectedId) => selectedId && entities[selectedId]
);
