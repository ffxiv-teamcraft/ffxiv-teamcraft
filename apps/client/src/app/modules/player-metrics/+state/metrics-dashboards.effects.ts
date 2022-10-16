import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as MetricsDashboardsActions from './metrics-dashboards.actions';
import { selectMetricsDashboard } from './metrics-dashboards.actions';
import { distinctUntilChanged, map, switchMap, switchMapTo, withLatestFrom } from 'rxjs/operators';
import { AuthFacade } from '../../../+state/auth.facade';
import { MetricsDashboardsService } from '../../../core/database/metrics-dashboards.service';
import { TeamcraftUser } from '../../../model/user/teamcraft-user';

@Injectable()
export class MetricsDashboardsEffects {
  loadMetricsDashboards$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MetricsDashboardsActions.loadMetricsDashboards),
      switchMapTo(this.authFacade.userId$),
      distinctUntilChanged(),
      switchMap((userId) => {
        return this.metricsDashboardsService.getByForeignKey(TeamcraftUser, userId);
      }),
      map(dashboards => {
        return MetricsDashboardsActions.loadMetricsDashboardsSuccess({ metricsDashboards: dashboards });
      })
    )
  );

  createMetricsDashboard$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MetricsDashboardsActions.createMetricsDashboard),
      withLatestFrom(this.authFacade.userId$),
      switchMap(([action, userId]) => {
        action.dashboard.authorId = userId;
        return this.metricsDashboardsService.add(action.dashboard);
      }),
      map(key => {
        return selectMetricsDashboard({ id: key });
      })
    )
  );

  updateMetricsDashboard$ = createEffect(() =>
      this.actions$.pipe(
        ofType(MetricsDashboardsActions.updateMetricsDashboard),
        switchMap(action => {
          return this.metricsDashboardsService.set(action.dashboard.$key, action.dashboard);
        })
      ),
    { dispatch: false }
  );

  deleteMetricsDashboard$ = createEffect(() =>
      this.actions$.pipe(
        ofType(MetricsDashboardsActions.deleteMetricsDashboard),
        switchMap(action => {
          return this.metricsDashboardsService.remove(action.id);
        })
      ),
    { dispatch: false }
  );

  constructor(private actions$: Actions, private authFacade: AuthFacade,
              private metricsDashboardsService: MetricsDashboardsService) {
  }
}
