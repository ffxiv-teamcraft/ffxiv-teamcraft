import { PlayerMetricProbe } from './player-metric-probe';
import { filter, map, withLatestFrom } from 'rxjs/operators';
import { ProbeReport } from '../model/probe-report';
import { Observable } from 'rxjs';
import { MetricType } from '../model/metric-type';
import { ContainerType } from '../../../model/user/inventory/container-type';
import { IpcService } from '../../../core/electron/ipc.service';
import { ProbeSource } from '../model/probe-source';
import { InventoryEventType } from '../../../model/user/inventory/inventory-event-type';
import { InventoryService } from '../../inventory/inventory.service';

export class CurrenciesProbe extends PlayerMetricProbe {
  constructor(protected ipc: IpcService, private inventoryService: InventoryService) {
    super(ipc);
  }

  getReports(): Observable<ProbeReport> {
    return this.inventoryService.inventoryEvents$.pipe(
      filter(patch => {
        return patch.type !== InventoryEventType.MOVED
          && [ContainerType.Currency, ContainerType.RetainerGil].includes(patch.containerId);
      }),
      withLatestFrom(this.source$),
      map(([event, source]) => {
        if (event.amount > 0 && (source === ProbeSource.TELEPORT || source === ProbeSource.MARKETBOARD)) {
          source = ProbeSource.UNKNOWN;
        }
        if (event.containerId === ContainerType.RetainerGil) {
          source = ProbeSource.MARKETBOARD;
        }
        return {
          type: MetricType.CURRENCY,
          data: [event.itemId, event.amount],
          source: source
        };
      })
    );
  }

}
