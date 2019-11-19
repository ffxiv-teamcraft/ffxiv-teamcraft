import { DataReporter } from './data-reporter';
import { BehaviorSubject, combineLatest, merge, Observable } from 'rxjs';
import { ofPacketType } from '../rxjs/of-packet-type';
import { debounceTime, filter, map, shareReplay, startWith, withLatestFrom } from 'rxjs/operators';
import { EorzeaFacade } from '../../modules/eorzea/+state/eorzea.facade';
import { actionTimeline } from '../data/sources/action-timeline';
import { LazyDataService } from '../data/lazy-data.service';
import { fishingSpots } from '../data/sources/fishing-spots';

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

  constructor(private eorzea: EorzeaFacade, private lazyData: LazyDataService) {
  }

  private getTug(value: number): Tug {
    switch (value) {
      case 292:
        return Tug.LIGHT;
      case 293:
        return Tug.MEDIUM;
      case 294:
        return Tug.BIG;
      default:
        return Tug.MEDIUM;
    }
  }

  getDataReports(packets$: Observable<any>): Observable<any[]> {
    const itemsObtained$ = packets$.pipe(
      ofPacketType('updateInventorySlot'),
      filter(packet => {
        return packet.containerId < 10 && packet.quantity > 0;
      })
    );

    const positionPackets$ = packets$.pipe(
      ofPacketType('updatePositionHandler'),
      debounceTime(1000)
    );

    const spot$ = combineLatest([this.eorzea.mapId$, positionPackets$]).pipe(
      filter(([mapId]) => this.lazyData.maps[mapId.toString()] !== undefined),
      map(([mapId, packet]) => {
        const mapData = this.lazyData.maps[mapId.toString()];
        const c = mapData.size_factor / 100;
        const raw = {
          x: (packet.pos.x + mapData.offset_x) * c,
          y: (packet.pos.z + mapData.offset_y) * c,
          z: (packet.pos.y) * c
        };
        return {
          mapId: mapId,
          x: (41 / c) * ((raw.x + 1024) / 2048) + 1,
          y: (41 / c) * ((raw.y + 1024) / 2048) + 1,
          z: (41 / c) * ((raw.z + 1024) / 2048) + 1
        };
      }),
      map(position => {
        const spots = fishingSpots.filter(spot => spot.mapId === position.mapId);
        return spots.sort((a, b) => {
          return Math.sqrt(Math.pow(a.coords.x - position.x, 2) + Math.pow(a.coords.y - position.y, 2));
        })[0];
      }),
      shareReplay(1)
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
      map(packet => {
        return {
          timestamp: Date.now(),
          mooch: packet.param5 === 275
        };
      })
    );

    const bite$ = eventPlay$.pipe(
      filter(packet => packet.scene === 5),
      map(packet => {
        return {
          timestamp: Date.now(),
          tug: this.getTug(packet.param5)
        };
      })
    );

    const actionTimeline$ = packets$.pipe(
      ofPacketType('eventUnk0'),
      map(packet => {
        return actionTimeline[packet.actionTimeline.toString()];
      })
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

    const fisherStats$ = combineLatest([
      packets$.pipe(ofPacketType('playerStats')),
      packets$.pipe(ofPacketType('updateClassInfo'))
    ]).pipe(
      filter(([, classInfo]) => {
        return classInfo.classId === 18
      }),
      map(([stats]) => {
        return {
          gathering: stats.gathering,
          perception: stats.perception,
          gp: stats.gp
        }
      })
    );

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
        hookset$,
        spot$,
        fisherStats$
      ),
      map(([patch, mapId, weatherId, previousWeatherId, baitId, statuses, throwData, biteData, lastFishCaught, hookset, spot, stats]) => {
        lastFishCaught$.next(patch.catalogId);
        const entry = {
          itemId: patch.catalogId,
          hq: patch.hq,
          mapId,
          weatherId,
          previousWeatherId,
          baitId,
          biteTime: Math.floor(biteData.timestamp - throwData.timestamp) / 100,
          fishEyes: statuses.indexOf(762) > -1,
          snagging: statuses.indexOf(761) > -1,
          mooch: throwData.mooch,
          tug: biteData.tug,
          hookset,
          spot: spot.id,
          ...stats
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
