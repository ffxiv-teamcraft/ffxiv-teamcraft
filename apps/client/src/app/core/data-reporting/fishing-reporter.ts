import { DataReporter } from './data-reporter';
import { BehaviorSubject, merge, Observable } from 'rxjs';
import { ofPacketType } from '../rxjs/of-packet-type';
import { filter, map, shareReplay, startWith, tap, withLatestFrom } from 'rxjs/operators';
import { EorzeaFacade } from '../../modules/eorzea/+state/eorzea.facade';
import { actionTimeline } from '../data/sources/action-timeline';

enum Tug {
  MEDIUM,
  BIG,
  LIGHT
}

enum Hookset {
  NORMAL,
  POWERFUL,
  PRECISION
}

export class FishingReporter implements DataReporter {

  constructor(private eorzea: EorzeaFacade) {
  }

  getDataReports(packets$: Observable<any>): Observable<any[]> {
    const itemsObtained$ = packets$.pipe(
      ofPacketType('updateInventorySlot'),
      filter(packet => {
        return packet.containerId < 10 && packet.quantity > 0;
      })
    );

    const isFishing$ = merge(
      packets$.pipe(ofPacketType('eventStart')),
      packets$.pipe(ofPacketType('eventFinish'))
    ).pipe(
      filter(packet => packet.eventId === 0x150001),
      map(packet => {
        return packet.type === 'eventStart';
      }),
      shareReplay(1)
    );

    const eventPlay$ = packets$.pipe(
      ofPacketType('eventPlay'),
      filter(packet => packet.eventId === 0x150001),
      tap(console.log)
    );

    const throw$ = eventPlay$.pipe(
      filter(packet => packet.scene === 1),
      map(packet => {
        return {
          timestamp: packet.timestamp,
          mooch: packet.param5 === 275
        };
      })
    );

    const bite$ = eventPlay$.pipe(
      filter(packet => packet.scene === 5),
      map(packet => {
        return {
          timestamp: packet.timestamp
        };
      })
    );

    const actionTimeline$ = packets$.pipe(
      ofPacketType('eventUnk0'),
      map(packet => actionTimeline[packet.actionTimeline.toString()])
    );

    const tug$ = actionTimeline$.pipe(
      map(key => {
        if (key.indexOf('_big') > -1) {
          return Tug.BIG;
        }
        return Tug.MEDIUM;
      }),
      startWith(Tug.MEDIUM)
    );

    const hookset$ = actionTimeline$.pipe(
      map(key => {
        if (key.indexOf('strong') > -1) {
          return Hookset.POWERFUL;
        }
        if (key.indexOf('precision') > -1) {
          return Hookset.PRECISION;
        }
        return Hookset.NORMAL;
      }),
      startWith(Hookset.NORMAL)
    );

    const lastFishCaught$ = new BehaviorSubject<number>(-1);

    return itemsObtained$.pipe(
      withLatestFrom(isFishing$),
      filter(([, isFishing]) => isFishing),
      map(([patch]) => patch),
      withLatestFrom(
        this.eorzea.mapId$,
        this.eorzea.weatherId$,
        this.eorzea.previousWeatherId$,
        this.eorzea.baitId$,
        this.eorzea.statuses$,
        throw$,
        bite$,
        lastFishCaught$,
        tug$,
        hookset$
      ),
      map(([patch, mapId, weatherId, previousWeatherId, baitId, statuses, throwData, biteData, lastFishCaught, tug, hookset]) => {
        lastFishCaught$.next(patch.catalogId);
        const entry = {
          itemId: patch.catalogId,
          mapId,
          weatherId,
          previousWeatherId,
          baitId,
          biteTime: biteData.timestamp - throwData.timestamp,
          fishEyes: statuses.indexOf(762) > -1,
          snagging: statuses.indexOf(761) > -1,
          mooch: throwData.mooch,
          tug,
          hookset
        };
        if (throwData.mooch) {
          throwData.baitId = lastFishCaught;
        }
        return [entry];
      })
    );
  }

  getDataType(): string {
    return 'fishing';
  }

}
