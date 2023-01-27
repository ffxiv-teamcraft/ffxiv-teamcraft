import { Observable } from 'rxjs';
import { ofMessageType } from '../rxjs/of-message-type';
import { filter, map, switchMap } from 'rxjs/operators';
import { toIpcData } from '../rxjs/to-ipc-data';
import { Message } from '@ffxiv-teamcraft/pcap-ffxiv';
import { DataReporter } from './data-reporter';
import { debounceBufferTime } from '../rxjs/debounce-buffer-time';
import { LazyDataFacade } from '../../lazy-data/+state/lazy-data.facade';

export class BnpcReporter implements DataReporter {

  constructor(private lazyData: LazyDataFacade) {
  }

  getDataReports(packets$: Observable<Message>): Observable<{ bnpcBase: number, bnpcName: number }[]> {
    return this.lazyData.getEntry('gubalBnpcsIndex').pipe(
      switchMap((index) => {
        return packets$.pipe(
          ofMessageType('npcSpawn'),
          toIpcData(),
          filter(packet => !index[packet.bNpcBase] && packet.bNpcBase > 0 && packet.bNpcName > 0),
          map((packet) => {
            return {
              bnpcBase: packet.bNpcBase,
              bnpcName: packet.bNpcName
            };
          }),
          filter(report => report !== null),
          debounceBufferTime(20000)
        );
      })
    );

  }

  getDataType(): string {
    return 'bnpc';
  }
}
