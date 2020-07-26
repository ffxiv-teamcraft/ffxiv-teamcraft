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
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MetricType } from '../../../modules/player-metrics/model/metric-type';
import { ProbeReport } from '../../../modules/player-metrics/model/probe-report';

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
            const filterFn = this.buildFilterFn(row);
            return {
              title: row.title,
              component: row.component,
              params: row.params,
              data: logs.filter(log => {
                return log !== undefined && (!log.type || log.type === row.type) && filterFn(log);
              })
            };
          }).filter(row => row !== null);
        })
      };
    })
  );

  editMode = false;

  layoutBackup: MetricsDashboardLayout;

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

  buildFilterFn(entry: MetricsDisplayEntry): (report: ProbeReport) => boolean {
    return entry.filters.reduce((fn, filterRow) => {
      const filterEntry = this.filters.find(f => f.getName() === filterRow.name);
      if (filterEntry === undefined) {
        console.warn(`Missing filter function for name ${filterRow.name}`);
        return fn;
      }
      return (report) => {
        let filterCall = filterEntry.matches(report, ...filterRow.args);
        if (filterRow.not) {
          filterCall = !filterCall;
        }
        switch (filterRow.gate) {
          case 'OR':
            return fn(report) || filterCall;
          case 'AND':
          default:
            return fn(report) && filterCall;
        }
      };
    }, (report) => true);
  }

  startEdit(layout: MetricsDashboardLayout): void {
    this.editMode = true;
    this.layoutBackup = new MetricsDashboardLayout(JSON.parse(JSON.stringify(layout.grid)));
  }

  saveLayout(layout: MetricsDashboardLayout): void {
    //TODO
    this.editMode = false;
  }

  cancelEditMode(layout: MetricsDashboardLayout): void {
    this.editMode = false;
    this.layout$.next(this.layoutBackup);
    delete this.layoutBackup;
  }

  addColumn(layout: MetricsDashboardLayout): void {
    layout.addColumn();
    this.layout$.next(layout);
  }

  deleteColumn(layout: MetricsDashboardLayout, index: number): void {
    layout.removeColumn(index);
    this.layout$.next(layout);
  }

  deleteEntry(layout: MetricsDashboardLayout, columnIndex: number, rowIndex: number): void {
    layout.grid[columnIndex].splice(rowIndex, 1);
    this.layout$.next(new MetricsDashboardLayout(JSON.parse(JSON.stringify(layout.grid))));
  }

  addEntry(layout: MetricsDashboardLayout, columnIndex: number): void {
    layout.grid[columnIndex].push({
      component: 'table',
      type: MetricType.ANY,
      filters: [{
        name: 'NoFilter',
        args: []
      }],
      title: 'New card'
    });
    this.layout$.next(layout);
  }

  moveEntry(layout: MetricsDashboardLayout, columnIndex: number, event: CdkDragDrop<any[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(layout.grid[columnIndex], event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        layout.grid[event.item.data.columnIndex],
        layout.grid[columnIndex],
        event.previousIndex,
        event.currentIndex
      );
    }
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
