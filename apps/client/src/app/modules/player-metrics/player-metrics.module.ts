import { NgModule, Provider } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PLAYER_METRICS_PROBES } from './probes/player-metric-probe';
import { CurrenciesProbe } from './probes/currencies-probe';
import { ItemsProbe } from './probes/items-probe';
import { MachinaService } from '../../core/electron/machina.service';
import { IpcService } from '../../core/electron/ipc.service';
import { TotalComponent } from './display/total/total.component';
import { METRICS_DISPLAY_FILTERS } from './filters/metrics-display-filter';
import { ItemFilter } from './filters/item-filter';
import { ObtentionFilter } from './filters/obtention-filter';
import { SourceFilter } from './filters/source-filter';
import { SpendingFilter } from './filters/spending-filter';
import { TypeFilter } from './filters/type-filter';
import { MetricDisplayComponent } from './display/metric-display/metric-display.component';
import { NzCardModule } from 'ng-zorro-antd';
import { NoFilter } from './filters/no-filter';
import { TranslateModule } from '@ngx-translate/core';
import { HistogramComponent } from './display/histogram/histogram.component';
import { LineChartModule, PieChartModule } from '@swimlane/ngx-charts';
import { PieChartComponent } from './display/pie-chart/pie-chart.component';


const probes: Provider[] = [
  {
    provide: PLAYER_METRICS_PROBES,
    useClass: CurrenciesProbe,
    deps: [IpcService, MachinaService],
    multi: true
  },
  {
    provide: PLAYER_METRICS_PROBES,
    useClass: ItemsProbe,
    deps: [IpcService, MachinaService],
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
    useClass: TypeFilter,
    multi: true
  },
  {
    provide: METRICS_DISPLAY_FILTERS,
    useClass: NoFilter,
    multi: true
  }
];

@NgModule({
  imports: [
    CommonModule,
    NzCardModule,
    TranslateModule,
    LineChartModule,
    PieChartModule
  ],
  providers: [
    ...probes,
    ...filters
  ],
  exports: [
    MetricDisplayComponent
  ],
  declarations: [TotalComponent, MetricDisplayComponent, HistogramComponent, PieChartComponent]
})
export class PlayerMetricsModule {
}
