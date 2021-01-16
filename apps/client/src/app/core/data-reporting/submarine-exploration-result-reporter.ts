import { DataReporter } from './data-reporter';
import { Observable } from 'rxjs/Observable';
import { UpdateInventorySlot } from '../../model/pcap';
import { ofPacketType } from '../rxjs/of-packet-type';
import { filter, map, shareReplay, startWith, tap, withLatestFrom } from 'rxjs/operators';
import { merge, zip } from 'rxjs';

export class SubmarineExplorationResultReporter implements DataReporter {
  private statusList$;
  private resultLog$;

  getDataReports(packets$: Observable<any>): Observable<any[]> {
    const isSubmarineMenuOpen$ = merge(
      packets$.pipe(ofPacketType('eventStart')),
      packets$.pipe(ofPacketType('eventFinish'))
    ).pipe(
      filter((packet) => packet.eventId === 0xB01BF),
      map((packet) => {
        return packet.type === 'eventStart';
      }),
      startWith(false),
      shareReplay(1)
    );

    this.resultLog$ = packets$.pipe(
      ofPacketType('submarineExplorationResult'),
      filter((packet) => packet.explorationResult),
      map((packet) => packet.explorationResult),
    );

    this.statusList$ = packets$.pipe(
      ofPacketType('submarineStatusList'),
      map((packet) => packet.statusList),
    );

    return merge(
      this.createSubmarineUpdateObservable(packets$, 0),
      this.createSubmarineUpdateObservable(packets$, 1),
      this.createSubmarineUpdateObservable(packets$, 2),
      this.createSubmarineUpdateObservable(packets$, 3)
    ).pipe(
      withLatestFrom(isSubmarineMenuOpen$),
      filter(([, isOpen]) => isOpen),
      map(([submarineBuild]) => submarineBuild),
      withLatestFrom(this.resultLog$),
      map(([status, resultLog]) => [{ status, resultLog }]),
      tap((data) => {
        console.log(data);
      })
    );
  }

  getDataType(): string {
    return 'submarineExplorationResult';
  }

  private createSubmarineUpdateObservable(packets$: Observable<any>, index: number) {
    const hull_slot = (index === 0 ? 0 : 5 * index);
    return zip(
      this.statusList$,
      this.createSubmarinePartUpdateObservable(packets$, hull_slot),
      this.createSubmarinePartUpdateObservable(packets$, hull_slot + 1),
      this.createSubmarinePartUpdateObservable(packets$, hull_slot + 2),
      this.createSubmarinePartUpdateObservable(packets$, hull_slot + 3)
    ).pipe(
      map(([statusList, hull, stern, bow, bridge]) => {
        return {
          submarineSlot: index,
          rank: statusList[index]['rank'],
          hull,
          stern,
          bow,
          bridge
        };
      })
    );
  }

  private createSubmarinePartUpdateObservable(packets$: Observable<any>, slot): Observable<UpdateInventorySlot> {
    return packets$.pipe(
      ofPacketType('updateInventorySlot'),
      filter((update: UpdateInventorySlot) => {
        return update.containerId === 25004 && update.slot === slot && update.condition < 30000;
      })
    );
  }
}
