import { createAction, props } from '@ngrx/store';
import { MetricsDashboardLayout } from '../display/metrics-dashboard-layout';

const PREFIX = '[MetricsDashboards]';

export const loadMetricsDashboards = createAction(
  `${PREFIX} Load MetricsDashboards`
);

export const loadMetricsDashboardsSuccess = createAction(
  `${PREFIX} Load MetricsDashboards Success`,
  props<{ metricsDashboards: MetricsDashboardLayout[] }>()
);

export const selectMetricsDashboard = createAction(
  `${PREFIX} Select MetricDashboard`,
  props<{ id: string }>()
);

export const createMetricsDashboard = createAction(
  `${PREFIX} Create MetricDashboard`,
  props<{ dashboard: MetricsDashboardLayout }>()
);

export const updateMetricsDashboard = createAction(
  `${PREFIX} Update MetricDashboard`,
  props<{ dashboard: MetricsDashboardLayout }>()
);

export const deleteMetricsDashboard = createAction(
  `${PREFIX} Delete MetricDashboard`,
  props<{ id: string }>()
);


