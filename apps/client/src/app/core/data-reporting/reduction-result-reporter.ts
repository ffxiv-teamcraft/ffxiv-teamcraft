import { Observable } from 'rxjs';
import { ofPacketSubType } from '../rxjs/of-packet-subtype';
import { DataReporter } from './data-reporter';
import { map } from 'rxjs/operators';
import { BasePacket, ReductionResult } from '../../model/pcap';

export class ReductionResultReporter implements DataReporter {

  getDataReports(packets$: Observable<BasePacket>): Observable<any[]> {
    const reductionResults$ = packets$.pipe(
      ofPacketSubType<ReductionResult>('reductionResult')
    );

    return reductionResults$.pipe(
      map((packet) => {
        return packet.result.map(item => {
          return {
            itemId: packet.itemId,
            resultItemId: item.itemId,
            resultItemQuantity: item.itemQuantity,
            resultItemHQ: item.itemHq
          };
        });
      })
    );
  }

  getDataType(): string {
    return 'reductionresults';
  }
}
