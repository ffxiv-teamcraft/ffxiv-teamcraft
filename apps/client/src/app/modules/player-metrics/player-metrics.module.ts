import { NgModule, Provider } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PLAYER_METRICS_PROBES } from './probes/player-metric-probe';
import { CurrenciesProbe } from './probes/currencies-probe';
import { ItemsProbe } from './probes/items-probe';
import { MachinaService } from '../../core/electron/machina.service';
import { IpcService } from '../../core/electron/ipc.service';


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

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    ...probes
  ]
})
export class PlayerMetricsModule {
}
