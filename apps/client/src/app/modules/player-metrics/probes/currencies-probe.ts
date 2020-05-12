import { PlayerMetricProbe } from './player-metric-probe';
import { filter, map, withLatestFrom } from 'rxjs/operators';
import { ProbeReport } from '../model/probe-report';
import { Observable } from 'rxjs';
import { MetricType } from '../model/metric-type';
import { MachinaService } from '../../../core/electron/machina.service';
import { ContainerType } from '../../../model/user/inventory/container-type';
import { IpcService } from '../../../core/electron/ipc.service';
import { ProbeSource } from '../model/probe-source';

export class CurrenciesProbe extends PlayerMetricProbe {
  constructor(protected ipc: IpcService, private machina: MachinaService) {
    super(ipc);
  }

  getReports(): Observable<ProbeReport> {
    return this.machina.inventoryEvents$.pipe(
      filter(patch => patch.containerId === ContainerType.Currency || patch.containerId === ContainerType.RetainerGil),
      withLatestFrom(this.source$),
      map(([event, source]) => {
        if (event.amount > 0 && (source === ProbeSource.TELEPORT || source === ProbeSource.MARKETBOARD)) {
          source = ProbeSource.UNKNOWN;
        }
        return {
          type: MetricType.CURRENCY,
          data: [event.itemId, event.amount, source]
        };
      })
    );
  }

}
