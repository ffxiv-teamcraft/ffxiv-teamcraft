import { PlayerMetricProbe } from './player-metric-probe';
import { filter, map, startWith, withLatestFrom } from 'rxjs/operators';
import { ProbeReport } from '../model/probe-report';
import { Observable } from 'rxjs';
import { MetricType } from '../model/metric-type';
import { MachinaService } from '../../../core/electron/machina.service';
import { ContainerType } from '../../../model/user/inventory/container-type';
import { IpcService } from '../../../core/electron/ipc.service';
import { ProbeSource } from '../model/probe-source';

export class ItemsProbe extends PlayerMetricProbe {

  constructor(protected ipc: IpcService, private machina: MachinaService) {
    super(ipc);
  }

  getReports(): Observable<ProbeReport> {
    return this.machina.inventoryEvents$.pipe(
      filter(patch => patch.containerId <= 10006 && [ContainerType.Currency, ContainerType.RetainerGil].indexOf(patch.containerId) === -1),
      withLatestFrom(this.source$, this.ipc.eventPlay4Packets$.pipe(filter(e => e.actionTimeline === 2), startWith(null))),
      map(([event, source, eventPlay4]) => {
        if (source === ProbeSource.TELEPORT) {
          source = ProbeSource.UNKNOWN;
        }
        const data = [event.itemId, event.amount, source];
        if (source === ProbeSource.CRAFTING) {
          data.push(eventPlay4.param1);
        }
        return {
          type: MetricType.ITEM,
          data: data
        };
      })
    );
  }
}
