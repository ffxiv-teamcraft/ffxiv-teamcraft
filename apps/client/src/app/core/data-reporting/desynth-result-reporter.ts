import { Observable, of } from 'rxjs';
import { DataReporter } from './data-reporter';
import { Injectable } from '@angular/core';
import { ofMessageType } from '../rxjs/of-message-type';
import { toIpcData } from '../rxjs/to-ipc-data';
import { Message } from '@ffxiv-teamcraft/pcap-ffxiv';

@Injectable()
export class DesynthResultReporter implements DataReporter {

  getDataReports(packets$: Observable<Message>): Observable<any[]> {
    const desynthResult$ = packets$.pipe(
      ofMessageType('desynthResult'),
      toIpcData()
    );

    // return desynthResult$.pipe(
    //   buffer(desynthResult$.pipe(debounceTime(1000))),
    //   map(packets => {
    //     return packets
    //       .map(packet => {
    //         return {
    //           itemId: packet.itemId,
    //           resultItemId: packet.itemResultId,
    //           itemHQ: packet.itemHq,
    //           resultItemHQ: packet.itemResultHq
    //         };
    //       });
    //   })
    // );
    return of([]);
  }

  getDataType(): string {
    return 'desynthresults';
  }
}
