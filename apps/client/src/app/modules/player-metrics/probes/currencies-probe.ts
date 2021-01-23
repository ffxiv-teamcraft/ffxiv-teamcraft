import { PlayerMetricProbe } from './player-metric-probe';
import { filter, map, withLatestFrom } from 'rxjs/operators';
import { ProbeReport } from '../model/probe-report';
import { Observable } from 'rxjs';
import { MetricType } from '../model/metric-type';
import { PacketCaptureTrackerService } from '../../../core/electron/packet-capture-tracker.service';
import { ContainerType } from '../../../model/user/inventory/container-type';
import { IpcService } from '../../../core/electron/ipc.service';
import { ProbeSource } from '../model/probe-source';
import { InventoryEventType } from '../../../model/user/inventory/inventory-event-type';

export class CurrenciesProbe extends PlayerMetricProbe {
  constructor(protected ipc: IpcService, private machina: PacketCaptureTrackerService) {
    super(ipc);
  }

  getReports(): Observable<ProbeReport> {
    return this.machina.inventoryEvents$.pipe(
      filter(patch => {
        return patch.type !== InventoryEventType.MOVED
          && patch.containerId === ContainerType.Currency;
      }),
      withLatestFrom(this.source$),
      map(([event, source]) => {
        if (event.amount > 0 && (source === ProbeSource.TELEPORT || source === ProbeSource.MARKETBOARD)) {
          source = ProbeSource.UNKNOWN;
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
