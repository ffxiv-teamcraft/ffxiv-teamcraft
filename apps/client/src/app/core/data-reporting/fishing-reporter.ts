import { DataReporter } from './data-reporter';
import { BehaviorSubject, combineLatest, merge, Observable, of } from 'rxjs';
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
    const possibleMooch$ = new BehaviorSubject<number>(-1);

    const actorControlSelf$ = packets$.pipe(
      ofPacketType('actorControlSelf'),
      filter(packet => packet.category === 320)
    );

    const fishCaught$ = actorControlSelf$.pipe(
      map(packet => {
        return {
          id: packet.param1,
          hq: (packet.param3 >> 4 & 1) === 1,
          moochable: (packet.param3 & 0x0000FFFF) === 5,
          size: packet.param2 >> 16
        };
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
      map(() => {
        return {
          timestamp: Date.now()
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

    const mooch$ = packets$.pipe(
      ofPacketType('eventUnk1'),
      filter(packet => packet.actionTimeline === 257),
      map(packet => {
        return packet.param1 === 1121;
      })
    );

    const misses$ = combineLatest([
      packets$.pipe(
        ofPacketType('eventUnk1'),
        map(packet => {
          return {
            animation: packet.actionTimeline,
            timestamp: Date.now()
          };
        })
      ),
      actionTimeline$.pipe(
        map(animation => {
          return {
            animation: animation,
            timestamp: Date.now()
          };
        })
      )
    ]).pipe(
      filter(([rodAnimation, playerAnimation]) => {
        return rodAnimation.animation === 283
          && Math.abs(rodAnimation.timestamp - playerAnimation.timestamp) < 200;
      }),
      map(() => {
        return {
          id: -1,
          hq: false
        };
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

    const fisherStats$ = combineLatest([
      packets$.pipe(ofPacketType('playerStats')),
      packets$.pipe(ofPacketType('updateClassInfo'))
    ]).pipe(
      filter(([, classInfo]) => {
        return classInfo.classId === 18;
      }),
      map(([stats]) => {
        return {
          gathering: stats.gathering,
          perception: stats.perception,
          gp: stats.gp
        };
      })
    );

    return merge(misses$, fishCaught$).pipe(
      withLatestFrom(isFishing$),
      filter(([, isFishing]) => isFishing),
      map(([fishData]) => fishData),
      withLatestFrom(
        this.eorzea.mapId$,
        this.eorzea.weatherId$,
        this.eorzea.previousWeatherId$,
        this.eorzea.baitId$,
        this.eorzea.statuses$,
        throw$,
        bite$,
        possibleMooch$,
        hookset$,
        spot$,
        fisherStats$,
        mooch$
      ),
      map(([fish, mapId, weatherId, previousWeatherId, baitId, statuses, throwData, biteData, possibleMooch, hookset, spot, stats, mooch]) => {
        if (fish.id && fish.moochable) {
          possibleMooch$.next(fish.id);
        }
        const entry = {
          itemId: fish.id,
          hq: fish.hq,
          mapId,
          weatherId,
          previousWeatherId,
          baitId,
          biteTime: Math.floor((biteData.timestamp - throwData.timestamp) / 100),
          fishEyes: statuses.indexOf(762) > -1,
          snagging: statuses.indexOf(761) > -1,
          mooch: mooch,
          tug: biteData.tug,
          hookset,
          spot: spot.id,
          size: fish.size,
          ...stats
        };
        if (mooch) {
          entry.baitId = possibleMooch;
        }
        return [entry];
      })
    );
  }

  getDataType(): string {
    return 'fishingresults';
  }

}
