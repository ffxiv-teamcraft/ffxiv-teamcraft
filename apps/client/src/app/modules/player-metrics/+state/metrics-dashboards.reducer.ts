import { createReducer, on, Action } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';

import * as MetricsDashboardsActions from './metrics-dashboards.actions';
import { MetricsDashboardLayout } from '../display/metrics-dashboard-layout';

export const METRICSDASHBOARDS_FEATURE_KEY = 'metricsDashboards';

export interface State extends EntityState<MetricsDashboardLayout> {
  selectedId?: string;
  loaded: boolean;
}

export interface MetricsDashboardsPartialState {
  readonly [METRICSDASHBOARDS_FEATURE_KEY]: State;
}

export const metricsDashboardsAdapter: EntityAdapter<MetricsDashboardLayout> = createEntityAdapter<MetricsDashboardLayout>({
  selectId: (dashboard) => dashboard.$key
});

export const initialState: State = metricsDashboardsAdapter.getInitialState({
  // set initial required properties
  loaded: false,
  selectedId: localStorage.getItem('metrics-dashboards:selected')
});

const metricsDashboardsReducer = createReducer(
  initialState,
  on(MetricsDashboardsActions.loadMetricsDashboards, state => ({
    ...state,
    loaded: false,
    error: null
  })),
  on(
    MetricsDashboardsActions.loadMetricsDashboardsSuccess,
    (state, { metricsDashboards }) =>
      metricsDashboardsAdapter.setAll(metricsDashboards, {
        ...state,
        loaded: true
      })
  ),
  on(
    MetricsDashboardsActions.selectMetricsDashboard,
    (state, { id }) => {
      return {
        ...state,
        selectedId: id
      };
    }
  ),
  on(
    MetricsDashboardsActions.updateMetricsDashboard,
    (state, { dashboard }) => {
      return metricsDashboardsAdapter.setOne(dashboard, {
        ...state,
        loaded: true
      });
    }
  )
);

export function reducer(state: State | undefined, action: Action) {
  return metricsDashboardsReducer(state, action);
}
