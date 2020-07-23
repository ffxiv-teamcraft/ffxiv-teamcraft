import { Component, Inject } from '@angular/core';
import { PlayerMetricsService } from '../../../modules/player-metrics/player-metrics.service';
import { TranslateService } from '@ngx-translate/core';
import { endOfDay, startOfDay, startOfMonth, startOfWeek } from 'date-fns';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { TeamcraftPageComponent } from '../../../core/component/teamcraft-page-component';
import { SeoMetaConfig } from '../../../core/seo/seo-meta-config';
import { SeoService } from '../../../core/seo/seo.service';
import { filter, map, takeUntil } from 'rxjs/operators';
import { MetricsDashboardLayout } from '../../../modules/player-metrics/display/metrics-dashboard-layout';
import { MetricsDisplay } from '../metrics-display';
import { METRICS_DISPLAY_FILTERS, MetricsDisplayFilter } from '../../../modules/player-metrics/filters/metrics-display-filter';
import { MetricsDisplayEntry } from '../../../modules/player-metrics/display/metrics-display-entry';

@Component({
  selector: 'app-metrics',
  templateUrl: './metrics.component.html',
  styleUrls: ['./metrics.component.less']
})
export class MetricsComponent extends TeamcraftPageComponent {

  // Date picker premade ranges
  ranges: any;

  timeRange$: BehaviorSubject<Date[]> = new BehaviorSubject<Date[]>([startOfDay(new Date()), endOfDay(new Date())]);

  layout$ = new BehaviorSubject(MetricsDashboardLayout.DEFAULT);

  display$: Observable<MetricsDisplay> = combineLatest([this.metricsService.logs$, this.layout$]).pipe(
    map(([logs, layout]) => {
      return {
        layout: layout,
        grid: layout.grid.map(column => {
          return column.map(row => {
            const filterEntry = this.filters.find(f => f.getName() === row.filter.name);
            if (filterEntry === undefined) {
              console.warn(`Missing filter function for name ${row.filter.name}`);
              return null;
            }
            return {
              title: row.title,
              component: row.component,
              params: row.params,
              data: logs.filter(log => {
                return log !== undefined && log.type === row.type && filterEntry.matches(log, row.filter.args);
              })
            };
          }).filter(row => row !== null);
        })
      };
    })
  );

  constructor(private metricsService: PlayerMetricsService, private translate: TranslateService,
              protected seoService: SeoService, @Inject(METRICS_DISPLAY_FILTERS) private filters: MetricsDisplayFilter<any>[]) {
    super(seoService);
    this.ranges = {};
    this.ranges[this.translate.instant('METRICS.Today')] = [startOfDay(new Date()), new Date()];
    this.ranges[this.translate.instant('METRICS.This_week')] = [startOfWeek(new Date()), new Date()];
    this.ranges[this.translate.instant('METRICS.This_month')] = [startOfMonth(new Date()), new Date()];

    this.timeRange$.pipe(
      takeUntil(this.onDestroy$),
      filter(([start, end]) => !!start && !!end)
    ).subscribe(([start, end]) => {
      this.metricsService.load(start, end);
    });
  }

  addColumn(): void {
    const layout = this.layout$.value;
    layout.addColumn();
    this.layout$.next(layout);
  }

  trackByColumn(index: number): number {
    return index;
  }

  trackByRow(index: number, row: MetricsDisplayEntry): string {
    return row.component;
  }

  protected getSeoMeta(): Observable<Partial<SeoMetaConfig>> {
    return of({});
  }

}
