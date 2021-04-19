import { merge, Observable } from 'rxjs';
import { ofMessageType } from '../rxjs/of-message-type';
import { filter, first, map, shareReplay, startWith, switchMap, withLatestFrom } from 'rxjs/operators';
import { LazyDataService } from '../data/lazy-data.service';
import { ExplorationResultReporter } from './exploration-result.reporter';
import { ExplorationType } from '../../model/other/exploration-type';
import { toIpcData } from '../rxjs/to-ipc-data';
import { AirshipStatus } from '@ffxiv-teamcraft/pcap-ffxiv';

export class AirshipExplorationResultReporter extends ExplorationResultReporter {

  constructor(private lazyData: LazyDataService) {
    super();
  }

  getDataReports(packets$: Observable<any>): Observable<any[]> {
    const isAirshipMenuOpen$: Observable<boolean> = merge(
      packets$.pipe(ofMessageType('eventStart')),
      packets$.pipe(ofMessageType('eventFinish'))
    ).pipe(
      filter((packet) => packet.parsedIpcData.eventId === 0xB0102),
      map((packet) => {
        return packet.type === 'eventStart';
      }),
      startWith(false),
      shareReplay(1)
    );

    const resultLog$ = packets$.pipe(
      ofMessageType('airshipExplorationResult'),
      toIpcData(),
      map((packet) => packet.explorationResult),
      shareReplay(1)
    );

    const status$ = packets$.pipe(
      ofMessageType('airshipStatus'),
      toIpcData()
    );

    return resultLog$.pipe(
      withLatestFrom(isAirshipMenuOpen$),
      filter(([, isOpen]) => isOpen),
      switchMap(([resultLog]) => {
        return status$.pipe(
          filter((status: AirshipStatus) => {
            return this.shouldSendReport(status.returnTime, resultLog.airshipSpeed, resultLog.explorationResult);
          }),
          map(status => {
            const stats = this.getBuildStats(status.hull, status.rigging, status.forecastle, status.aftcastle);
            return this.createReportsList(stats, resultLog);
          }),
          // Once the report is sent, dispose this Observable so the next emission of stats won't trigger a new report
          first()
        );
      })
    );
  }

  getExplorationType(): ExplorationType {
    return ExplorationType.AIRSHIP;
  }

  private getBuildStats(hullId: number, riggingId: number, forecastleId: number, aftcastleId: number): { surveillance: number, retrieval: number, favor: number } {
    const hull = this.lazyData.data.airshipParts[hullId];
    const rigging = this.lazyData.data.airshipParts[riggingId];
    const forecastle = this.lazyData.data.airshipParts[forecastleId];
    const aftcastle = this.lazyData.data.airshipParts[aftcastleId];
    return {
      surveillance: +hull.surveillance + +rigging.surveillance + +forecastle.surveillance + +aftcastle.surveillance,
      retrieval: +hull.retrieval + +rigging.retrieval + +forecastle.retrieval + +aftcastle.retrieval,
      favor: +hull.favor + +rigging.favor + forecastle.favor + +aftcastle.favor
    };
  }
}
