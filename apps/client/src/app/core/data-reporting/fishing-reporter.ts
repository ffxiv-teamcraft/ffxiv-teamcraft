import { DataReporter } from './data-reporter';
import { merge, Observable } from 'rxjs';
import { ofPacketType } from '../rxjs/of-packet-type';
import { filter, map, shareReplay, tap, withLatestFrom } from 'rxjs/operators';
import { EorzeaFacade } from '../../modules/eorzea/+state/eorzea.facade';

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
      filter(packet => packet.eventId === 0x150001)
    );

    const throw$ = eventPlay$.pipe(
      filter(packet => packet.scene === 1),
      map(packet => packet.timestamp)
    );

    const bite$ = eventPlay$.pipe(
      filter(packet => packet.scene === 2),
      map(packet => packet.timestamp)
    );

    throw$.subscribe(a => console.log('throw$', a));
    bite$.subscribe(a => console.log('bite$', a));
    itemsObtained$.subscribe(a => console.log('itemsObtained$', a));

    return itemsObtained$.pipe(
      withLatestFrom(isFishing$),
      filter(([, isFishing]) => isFishing),
      map(([patch]) => patch),
      withLatestFrom(
        this.eorzea.mapId$,
        this.eorzea.weatherId$,
        this.eorzea.previousWeatherId$,
        this.eorzea.baitId$,
        throw$,
        bite$
      ),
      map(([patch, mapId, weatherId, previousWeatherId, baitId, throwTime, biteTime]) => {
        return [{
          itemId: patch.catalogId,
          mapId,
          weatherId,
          previousWeatherId,
          baitId,
          biteTime: biteTime - throwTime
        }];
      }),
      tap(console.log)
    );
  }

  getDataType(): string {
    return 'fishing';
  }

}
