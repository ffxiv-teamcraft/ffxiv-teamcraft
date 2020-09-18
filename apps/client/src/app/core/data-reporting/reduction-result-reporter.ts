import { Observable } from 'rxjs';
import { ofPacketSubType } from '../rxjs/of-packet-subtype';
import { DataReporter } from './data-reporter';
import { map } from 'rxjs/operators';
import { AetherReductionDlg, ActorControl } from '../../model/pcap';

export class ReductionResultReporter implements DataReporter {

  getDataReports(packets$: Observable<ActorControl>): Observable<any[]> {
    const reductionResults$ = packets$.pipe<AetherReductionDlg>(
      ofPacketSubType('aetherReductionDlg')
    );

    return reductionResults$.pipe(
      map((packet) => {
        return packet.resultItems.map(item => {
          return {
            itemId: packet.reducedItemID,
            purity: 0,
            collectability: 0,
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
