import { Observable } from 'rxjs';
import { buffer, debounceTime, map } from 'rxjs/operators';
import { DataReporter } from './data-reporter';
import { Injectable } from '@angular/core';
import { ActorControl, DesynthResult } from '../../model/pcap';
import { ofPacketType } from '../rxjs/of-packet-type';

@Injectable()
export class DesynthResultReporter implements DataReporter {

  getDataReports(packets$: Observable<ActorControl>): Observable<any[]> {
    const desynthResult$ = packets$.pipe(
      ofPacketType<DesynthResult>('desynthResult')
    );

    return desynthResult$.pipe(
      buffer(desynthResult$.pipe(debounceTime(1000))),
      map(packets => {
        return packets
          .map(packet => {
            return {
              itemId: packet.itemId,
              resultItemId: packet.itemResultId,
              itemHQ: packet.itemHq,
              resultItemHQ: packet.itemResultHq
            };
          });
      })
    );
  }

  getDataType(): string {
    return 'desynthresults';
  }
}
