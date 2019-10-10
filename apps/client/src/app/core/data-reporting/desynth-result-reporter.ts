import { Observable } from 'rxjs';
import { ofPacketSubType } from '../rxjs/of-packet-subtype';
import { buffer, debounceTime, map } from 'rxjs/operators';
import { DataReporter } from './data-reporter';

export class DesynthResultReporter implements DataReporter {

  getDataReports(packets$: Observable<any>): Observable<any[]> {
    const desynthResult$ = packets$.pipe(
      ofPacketSubType('desynthResult')
    );

    return desynthResult$.pipe(
      buffer(desynthResult$.pipe(debounceTime(1000))),
      map(packets => {
        const sourceItemPacket = packets.find(p => p.resultType === 4321);
        if (sourceItemPacket === undefined) {
          return [];
        }
        const resultItemIds = packets.filter(p => p.resultType === 4322).map(p => p.itemID);
        return resultItemIds
          .map(resultItemId => {
            return {
              itemId: sourceItemPacket.itemID,
              resultItemId: resultItemId
            };
          });
      })
    );
  }

  getDataType(): string {
    return 'desynthresults';
  }
}
