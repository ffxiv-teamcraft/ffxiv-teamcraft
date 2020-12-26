import { Observable } from 'rxjs';
import { ofPacketSubType } from '../rxjs/of-packet-subtype';
import { DataReporter } from './data-reporter';
import { filter, map, withLatestFrom } from 'rxjs/operators';
import { AetherReductionDlg, ActorControl } from '../../model/pcap';
import { PcapService } from '../electron/pcap.service';

export class ReductionResultReporter implements DataReporter {

  constructor(private machina: PcapService) {
  }

  getDataReports(packets$: Observable<ActorControl>): Observable<any[]> {
    const reductionResults$ = packets$.pipe<AetherReductionDlg>(
      ofPacketSubType('aetherReductionDlg')
    );

    const inventoryPatches$ = this.machina.inventoryPatches$.pipe(
      filter(patch => {
        return patch.quantity < 0 && patch.spiritBond && patch.spiritBond > 0;
      })
    );

    return reductionResults$.pipe(
      withLatestFrom(inventoryPatches$),
      map(([packet, patch]) => {
        return packet.resultItems.map(item => {
          return {
            itemId: packet.reducedItemID,
            collectability: patch.spiritBond,
            resultItemId: item.itemId,
            resultItemQuantity: item.quantity,
            resultItemHQ: item.hq
          };
        });
      })
    );
  }

  getDataType(): string {
    return 'reductionresults';
  }
}
