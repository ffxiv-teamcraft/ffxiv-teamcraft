import { combineLatest, merge, Observable } from 'rxjs';
import { ofMessageType } from '../rxjs/of-message-type';
import { filter, first, map, shareReplay, startWith, switchMap, withLatestFrom } from 'rxjs/operators';
import { ExplorationResultReporter } from './exploration-result.reporter';
import { ExplorationType } from '../../model/other/exploration-type';
import { toIpcData } from '../rxjs/to-ipc-data';
import { AirshipStatus } from '@ffxiv-teamcraft/pcap-ffxiv';
import { LazyDataFacade } from '../../lazy-data/+state/lazy-data.facade';

export class AirshipExplorationResultReporter extends ExplorationResultReporter {

  constructor(private lazyData: LazyDataFacade) {
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
      shareReplay({ bufferSize: 1, refCount: true })
    );

    const resultLog$ = packets$.pipe(
      ofMessageType('airshipExplorationResult'),
      toIpcData(),
      map((packet) => packet.explorationResult),
      shareReplay({ bufferSize: 1, refCount: true })
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

  private getBuildStats(hullId: number, riggingId: number, forecastleId: number, aftcastleId: number): Observable<{ surveillance: number, retrieval: number, favor: number }> {
    return combineLatest([
      this.lazyData.getRow('airshipParts', hullId),
      this.lazyData.getRow('airshipParts', riggingId),
      this.lazyData.getRow('airshipParts', forecastleId),
      this.lazyData.getRow('airshipParts', aftcastleId)
    ]).pipe(
      map(([hull, rigging, forecastle, aftcastle]) => {
        return {
          surveillance: +hull.surveillance + +rigging.surveillance + +forecastle.surveillance + +aftcastle.surveillance,
          retrieval: +hull.retrieval + +rigging.retrieval + +forecastle.retrieval + +aftcastle.retrieval,
          favor: +hull.favor + +rigging.favor + +forecastle.favor + +aftcastle.favor
        };
      })
    );
  }
}
