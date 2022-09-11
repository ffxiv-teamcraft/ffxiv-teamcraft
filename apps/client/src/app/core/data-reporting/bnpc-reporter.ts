import { Observable } from 'rxjs';
import { ofMessageType } from '../rxjs/of-message-type';
import { filter, map } from 'rxjs/operators';
import { toIpcData } from '../rxjs/to-ipc-data';
import { Message } from '@ffxiv-teamcraft/pcap-ffxiv';
import { DataReporter } from './data-reporter';
import { debounceBufferTime } from '../rxjs/debounce-buffer-time';

export class BnpcReporter implements DataReporter {
  getDataReports(packets$: Observable<Message>): Observable<{ bnpcBase: number, bnpcName: number }[]> {
    return packets$.pipe(
      ofMessageType('npcSpawn'),
      toIpcData(),
      map((packet) => {
        return {
          bnpcBase: packet.bNpcBase,
          bnpcName: packet.bNpcName
        };
      }),
      filter(report => report !== null),
      debounceBufferTime(10000)
    );
  }

  getDataType(): string {
    return 'bnpc';
  }
}
