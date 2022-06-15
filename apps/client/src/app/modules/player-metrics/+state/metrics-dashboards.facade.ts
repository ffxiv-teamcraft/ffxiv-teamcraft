import { Injectable } from '@angular/core';

import { select, Store } from '@ngrx/store';

import * as fromMetricsDashboards from './metrics-dashboards.reducer';
import * as MetricsDashboardsSelectors from './metrics-dashboards.selectors';
import {
  createMetricsDashboard,
  deleteMetricsDashboard,
  loadMetricsDashboards,
  selectMetricsDashboard,
  updateMetricsDashboard
} from './metrics-dashboards.actions';
import { MetricsDashboardLayout } from '../display/metrics-dashboard-layout';
import { filter, map, shareReplay } from 'rxjs/operators';
import { combineLatest } from 'rxjs';

@Injectable()
export class MetricsDashboardsFacade {
  loaded$ = this.store.pipe(
    select(MetricsDashboardsSelectors.getMetricsDashboardsLoaded)
  );

  allMetricsDashboards$ = this.store.pipe(
    select(MetricsDashboardsSelectors.getAllMetricsDashboards)
  );

  selectedMetricsDashboard$ = combineLatest([
    this.store.pipe(select(MetricsDashboardsSelectors.getSelected)),
    this.store.pipe(select(MetricsDashboardsSelectors.getMetricsDashboardsLoaded))
  ]).pipe(
    filter(([, loaded]) => loaded),
    map(([layout]) => {
      return layout || MetricsDashboardLayout.DEFAULT;
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor(
    private store: Store<fromMetricsDashboards.MetricsDashboardsPartialState>
  ) {
  }

  loadAll(): void {
    this.store.dispatch(loadMetricsDashboards());
  }

  createLayout(layout: MetricsDashboardLayout): void {
    this.store.dispatch(createMetricsDashboard({ dashboard: layout }));
  }

  selectLayout(key: string): void {
    this.store.dispatch(selectMetricsDashboard({ id: key }));
    localStorage.setItem('metrics-dashboards:selected', key);
  }

  updateLayout(layout: MetricsDashboardLayout): void {
    this.store.dispatch(updateMetricsDashboard({ dashboard: layout }));
  }

  deleteLayout(key: string) {
    this.store.dispatch(deleteMetricsDashboard({ id: key }));
  }
}
