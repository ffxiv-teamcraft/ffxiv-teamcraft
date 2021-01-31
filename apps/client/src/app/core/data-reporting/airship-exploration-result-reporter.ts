import { Observable } from 'rxjs/Observable';
import { ofPacketType } from '../rxjs/of-packet-type';
import { filter, map, shareReplay, startWith, withLatestFrom } from 'rxjs/operators';
import { merge } from 'rxjs';
import { LazyDataService } from '../data/lazy-data.service';
import { ExplorationResultReporter } from './exploration-result.reporter';
import { ExplorationType } from '../../model/other/exploration-type';
import { UpdateInventorySlot } from '../../model/pcap';
import { AirshipStatus } from '../../model/pcap';
import { AirshipExplorationResult } from '../../model/pcap';

export class AirshipExplorationResultReporter extends ExplorationResultReporter {

  constructor(private lazyData: LazyDataService) {
    super();
  }

  getDataReports(packets$: Observable<any>): Observable<any[]> {
    const isAirshipMenuOpen$: Observable<boolean> = merge(
      packets$.pipe(ofPacketType('eventStart')),
      packets$.pipe(ofPacketType('eventFinish'))
    ).pipe(
      filter((packet) => packet.eventId === 0xB0102),
      map((packet) => {
        return packet.type === 'eventStart';
      }),
      startWith(false),
      shareReplay(1)
    );

    const resultLog$ = packets$.pipe(
      ofPacketType<AirshipExplorationResult>('airshipExplorationResult'),
      map((packet) => packet.explorationResult)
    );

    const status$ = packets$.pipe(
      ofPacketType<AirshipStatus>('airshipStatus')
    );

    const updateHullCondition$ = packets$.pipe(
      ofPacketType<UpdateInventorySlot>('updateInventorySlot'),
      withLatestFrom(isAirshipMenuOpen$),
      filter(([updateInventory, isOpen]) => {
        return isOpen && updateInventory.containerId === 25003 && [30, 35, 40, 45].includes(updateInventory.slot) && updateInventory.condition < 30000;
      })
    );

    return updateHullCondition$.pipe(
      withLatestFrom(status$),
      map(([, status]) => {
        return this.getBuildStats(status.hull, status.rigging, status.forecastle, status.aftcastle);
      }),
      withLatestFrom(resultLog$),
      map(([stats, resultLog]): any[] => this.createReportsList(stats, resultLog))
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
