import { PlayerMetricProbe } from './player-metric-probe';
import { filter, map, startWith, withLatestFrom } from 'rxjs/operators';
import { ProbeReport } from '../model/probe-report';
import { Observable } from 'rxjs';
import { MetricType } from '../model/metric-type';
import { ContainerType } from '../../../model/user/inventory/container-type';
import { IpcService } from '../../../core/electron/ipc.service';
import { ProbeSource } from '../model/probe-source';
import { InventoryService } from '../../inventory/inventory.service';

export class ItemsProbe extends PlayerMetricProbe {

  constructor(protected ipc: IpcService, private inventoryService: InventoryService) {
    super(ipc);
  }

  getReports(): Observable<ProbeReport> {
    return this.inventoryService.inventoryEvents$.pipe(
      filter(patch => patch.containerId <= 10006 && [ContainerType.Currency, ContainerType.RetainerGil].indexOf(patch.containerId) === -1),
      withLatestFrom(this.source$, this.ipc.eventPlay4Packets$.pipe(filter(e => e.params[0] === 2), startWith(null))),
      map(([event, source, eventPlay4]) => {
        if (source === ProbeSource.TELEPORT) {
          source = ProbeSource.UNKNOWN;
        }
        const data = [event.itemId, event.amount];
        if (source === ProbeSource.CRAFTING && eventPlay4 !== null) {
          data.push(eventPlay4.params[1]);
        }
        return {
          type: MetricType.ITEM,
          data: data,
          source: source
        };
      })
    );
  }
}
