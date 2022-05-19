import { Component, Inject } from '@angular/core';
import { PlayerMetricsService } from '../../../modules/player-metrics/player-metrics.service';
import { TranslateService } from '@ngx-translate/core';
import { endOfDay, startOfDay, startOfMonth, startOfWeek } from 'date-fns';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { TeamcraftPageComponent } from '../../../core/component/teamcraft-page-component';
import { SeoMetaConfig } from '../../../core/seo/seo-meta-config';
import { SeoService } from '../../../core/seo/seo.service';
import { catchError, filter, map, takeUntil } from 'rxjs/operators';
import { MetricsDashboardLayout } from '../../../modules/player-metrics/display/metrics-dashboard-layout';
import { MetricsDisplay } from '../metrics-display';
import { METRICS_DISPLAY_FILTERS, MetricsDisplayFilter } from '../../../modules/player-metrics/filters/metrics-display-filter';
import { MetricsDisplayEntry } from '../../../modules/player-metrics/display/metrics-display-entry';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MetricType } from '../../../modules/player-metrics/model/metric-type';
import { ProbeReport } from '../../../modules/player-metrics/model/probe-report';
import { PendingChangesService } from '../../../core/database/pending-changes/pending-changes.service';
import { MetricsDashboardsFacade } from '../../../modules/player-metrics/+state/metrics-dashboards.facade';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TextQuestionPopupComponent } from '../../../modules/text-question-popup/text-question-popup/text-question-popup.component';

@Component({
  selector: 'app-metrics',
  templateUrl: './metrics.component.html',
  styleUrls: ['./metrics.component.less']
})
export class MetricsComponent extends TeamcraftPageComponent {

  // Date picker premade ranges
  ranges: any;

  timeRange$: BehaviorSubject<Date[]> = new BehaviorSubject<Date[]>([startOfDay(new Date()), endOfDay(new Date())]);

  layout$: Observable<MetricsDashboardLayout> = this.metricsDashboardsFacade.selectedMetricsDashboard$;

  allDashboardLayouts$ = this.metricsDashboardsFacade.allMetricsDashboards$;

  editedLayout: MetricsDashboardLayout;

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
              filters: row.filters,
              data: logs.filter(log => {
                return log !== undefined && (!log.type || log.type === row.type) && filterFn(log);
              })
            };
          }).filter(row => row !== null);
        }),
        empty: logs.length === 0
      };
    })
  );

  editMode = false;

  layoutBackup: MetricsDashboardLayout;

  constructor(private metricsService: PlayerMetricsService, private translate: TranslateService,
              protected seoService: SeoService, @Inject(METRICS_DISPLAY_FILTERS) private filters: MetricsDisplayFilter<any>[],
              private pendingChangesService: PendingChangesService, private metricsDashboardsFacade: MetricsDashboardsFacade,
              private message: NzMessageService, private dialog: NzModalService) {
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

    this.metricsDashboardsFacade.loadAll();
  }

  importLayout(): void {
    this.dialog.create({
      nzContent: TextQuestionPopupComponent,
      nzComponentParams: {
        placeholder: 'METRICS.Export_code'
      },
      nzFooter: null,
      nzTitle: this.translate.instant('METRICS.Import_dashboard')
    }).afterClose
      .pipe(
        filter(code => code && code.length > 0),
        map(code => {
          const parsed = JSON.parse(code);
          if (parsed && parsed.grid && parsed.name && Array.isArray(parsed.grid)) {
            return new MetricsDashboardLayout(parsed.name, parsed.grid);
          } else {
            return false;
          }
        }),
        catchError(() => {
          return of(false);
        })
      ).subscribe(layout => {
      if (!layout) {
        this.message.error('METRICS.Import_failed');
      } else {
        this.metricsDashboardsFacade.createLayout(layout as MetricsDashboardLayout);
        this.message.success(this.translate.instant('METRICS.Import_success'));
      }
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
    if (layout.isDefault) {
      return;
    }
    this.layoutBackup = layout.clone();
    this.editedLayout = layout;
    this.pendingChangesService.addPendingChange('metrics-dashboard-edit');
    this.editMode = true;
  }

  selectLayout(key: string): void {
    this.metricsDashboardsFacade.selectLayout(key);
  }

  createNewLayout(): void {
    const newLayout = new MetricsDashboardLayout('New dashboard', MetricsDashboardLayout.DEFAULT.grid);
    this.metricsDashboardsFacade.createLayout(newLayout);
  }

  deleteLayout(key: string): void {
    this.metricsDashboardsFacade.deleteLayout(key);
  }

  saveLayout(layout: MetricsDashboardLayout): void {
    this.editMode = false;
    this.metricsDashboardsFacade.updateLayout(layout);
    this.pendingChangesService.removePendingChange('metrics-dashboard-edit');
  }

  cancelEditMode(): void {
    this.editMode = false;
    this.editedLayout = this.layoutBackup;
    delete this.layoutBackup;
    this.pendingChangesService.removePendingChange('metrics-dashboard-edit');
  }

  addColumn(layout: MetricsDashboardLayout): void {
    layout.addColumn();
    this.editedLayout = layout;
  }

  deleteColumn(layout: MetricsDashboardLayout, index: number): void {
    layout.removeColumn(index);
    this.editedLayout = layout;
  }

  deleteEntry(layout: MetricsDashboardLayout, columnIndex: number, rowIndex: number): void {
    const clone = layout.clone();
    clone.grid[columnIndex].splice(rowIndex, 1);
    this.editedLayout = clone;
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
    this.editedLayout = layout;
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
    this.editedLayout = layout;
  }

  trackByColumn(index: number): number {
    return index;
  }

  trackByRow(index: number, row: MetricsDisplayEntry): string {
    const { data, ...structure } = row;
    return JSON.stringify(structure);
  }

  trackByEditorRow(index: number, row: MetricsDisplayEntry): number {
    return index;
  }

  protected getSeoMeta(): Observable<Partial<SeoMetaConfig>> {
    return of({});
  }

}
