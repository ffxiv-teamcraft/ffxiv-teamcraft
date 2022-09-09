import { combineLatest, Observable } from 'rxjs';
import { ofMessageType } from '../rxjs/of-message-type';
import { filter, map, tap } from 'rxjs/operators';
import { toIpcData } from '../rxjs/to-ipc-data';
import { Message } from '@ffxiv-teamcraft/pcap-ffxiv';
import { DataReporter } from './data-reporter';
import { debounceBufferTime } from '../rxjs/debounce-buffer-time';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';

export class BnpcReporter implements DataReporter {
  constructor(private apollo: Apollo) {
  }

  getDataReports(packets$: Observable<Message>): Observable<{ bnpcBase: number, bnpcName: number }[]> {
    const existingReports$ = this.apollo.query<any>({
      query: gql`query BnpcReporterInitQuery {
            bnpc {
              bnpcBase
              bnpcName
            }
          }`,
      fetchPolicy: 'network-only'
    }).pipe(
      map(reports => {
        return reports.data.bnpc.reduce((acc, report) => {
          return {
            ...acc,
            [report.bnpcBase]: [...(acc[report.bnpcBase] || []), report.bnpcName]
          };
        }, {});
      })
    );
    return combineLatest([packets$.pipe(
      ofMessageType('npcSpawn'),
      toIpcData()),
      existingReports$
    ]).pipe(
      map(([packet, existingReports]) => {
        if ((existingReports[packet.bNpcBase] || []).includes(packet.bNpcName)) {
          return null;
        }
        return {
          bnpcBase: packet.bNpcBase,
          bnpcName: packet.bNpcName
        };
      }),
      filter(report => report !== null),
      debounceBufferTime(10000),
      tap(console.log)
    );
  }

  getDataType(): string {
    return 'bnpc';
  }
}
