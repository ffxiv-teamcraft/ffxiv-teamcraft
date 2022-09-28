import { Observable } from 'rxjs';
import { DataReporter } from './data-reporter';
import { filter, map } from 'rxjs/operators';
import { Message } from '@ffxiv-teamcraft/pcap-ffxiv';
import { ofMessageType } from '../rxjs/of-message-type';
import { toIpcData } from '../rxjs/to-ipc-data';

export class ReductionResultReporter implements DataReporter {

  getDataReports(packets$: Observable<Message>): Observable<any[]> {
    return packets$.pipe(
      filter(packet => packet.header.sourceActor === packet.header.targetActor),
      ofMessageType('resultDialog', 'reductionResult'),
      toIpcData(),
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
