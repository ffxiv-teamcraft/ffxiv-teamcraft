import { NgModule, Provider } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PLAYER_METRICS_PROBES } from './probes/player-metric-probe';
import { CurrenciesProbe } from './probes/currencies-probe';
import { ItemsProbe } from './probes/items-probe';
import { IpcService } from '../../core/electron/ipc.service';
import { TotalComponent } from './display/total/total.component';
import { METRICS_DISPLAY_FILTERS } from './filters/metrics-display-filter';
import { ItemFilter } from './filters/item-filter';
import { ObtentionFilter } from './filters/obtention-filter';
import { SourceFilter } from './filters/source-filter';
import { SpendingFilter } from './filters/spending-filter';
import { MetricDisplayComponent } from './display/metric-display/metric-display.component';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NoFilter } from './filters/no-filter';
import { TranslateModule } from '@ngx-translate/core';
import { HistogramComponent } from './display/histogram/histogram.component';
import { LineChartModule, PieChartModule } from '@swimlane/ngx-charts';
import { PieChartComponent } from './display/pie-chart/pie-chart.component';
import { TableComponent } from './display/table/table.component';
import { PipesModule } from '../../pipes/pipes.module';
import { CoreModule } from '../../core/core.module';
import { RouterModule } from '@angular/router';
import { MetricsDisplayEditorComponent } from './display/metrics-display-editor/metrics-display-editor.component';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FishFilter } from './filters/fish-filter';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import * as fromMetricsDashboards from './+state/metrics-dashboards.reducer';
import { MetricsDashboardsEffects } from './+state/metrics-dashboards.effects';
import { MetricsDashboardsFacade } from './+state/metrics-dashboards.facade';
import { GilFilter } from './filters/gil-filter';
import { InventoryService } from '../inventory/inventory.service';
import { LazyDataFacade } from '../../lazy-data/+state/lazy-data.facade';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NgxEchartsModule } from 'ngx-echarts';
import { NzEmptyModule } from 'ng-zorro-antd/empty';

const probes: Provider[] = [
  {
    provide: PLAYER_METRICS_PROBES,
    useClass: CurrenciesProbe,
    deps: [IpcService, InventoryService],
    multi: true
  },
  {
    provide: PLAYER_METRICS_PROBES,
    useClass: ItemsProbe,
    deps: [IpcService, InventoryService],
    multi: true
  }
];

const filters: Provider[] = [
  {
    provide: METRICS_DISPLAY_FILTERS,
    useClass: ItemFilter,
    multi: true
  },
  {
    provide: METRICS_DISPLAY_FILTERS,
    useClass: ObtentionFilter,
    multi: true
  },
  {
    provide: METRICS_DISPLAY_FILTERS,
    useClass: SourceFilter,
    multi: true
  },
  {
    provide: METRICS_DISPLAY_FILTERS,
    useClass: SpendingFilter,
    multi: true
  },
  {
    provide: METRICS_DISPLAY_FILTERS,
    useClass: NoFilter,
    multi: true
  },
  {
    provide: METRICS_DISPLAY_FILTERS,
    useClass: GilFilter,
    multi: true
  },
  {
    provide: METRICS_DISPLAY_FILTERS,
    useClass: FishFilter,
    deps: [LazyDataFacade],
    multi: true
  }
];

@NgModule({
  imports: [
    CommonModule,
    NzCardModule,
    TranslateModule,
    LineChartModule,
    PieChartModule,
    NzTableModule,
    PipesModule,
    CoreModule,
    RouterModule,
    NzDividerModule,
    NzSelectModule,
    FormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzPopconfirmModule,
    NzIconModule,
    FlexLayoutModule,
    NzAutocompleteModule,
    NzInputNumberModule,
    DragDropModule,
    NzCheckboxModule,
    StoreModule.forFeature(
      fromMetricsDashboards.METRICSDASHBOARDS_FEATURE_KEY,
      fromMetricsDashboards.reducer
    ),
    EffectsModule.forFeature([MetricsDashboardsEffects]),
    NzStatisticModule,
    NgxEchartsModule,
    NzEmptyModule
  ],
  providers: [...probes, ...filters, MetricsDashboardsFacade],
  exports: [MetricDisplayComponent, MetricsDisplayEditorComponent],
  declarations: [
    TotalComponent,
    MetricDisplayComponent,
    HistogramComponent,
    PieChartComponent,
    TableComponent,
    MetricsDisplayEditorComponent
  ]
})
export class PlayerMetricsModule {
}
