import { DataReporter } from './data-reporter';
import { BehaviorSubject, combineLatest, merge, Observable } from 'rxjs';
import { ofPacketType } from '../rxjs/of-packet-type';
import { debounceTime, distinctUntilChanged, filter, map, shareReplay, startWith, tap, withLatestFrom } from 'rxjs/operators';
import { EorzeaFacade } from '../../modules/eorzea/+state/eorzea.facade';
import { LazyDataService } from '../data/lazy-data.service';
import { EorzeanTimeService } from '../eorzea/eorzean-time.service';
import { IpcService } from '../electron/ipc.service';

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

  private state: any = {};

  constructor(private eorzea: EorzeaFacade, private lazyData: LazyDataService,
              private etime: EorzeanTimeService, private ipc: IpcService) {
  }

  private setState(newState: any): void {
    this.state = {
      ...this.state,
      ...newState
    };
    this.ipc.send('fishing-state:set', this.state);
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
        return null;
    }
  }

  getDataReports(packets$: Observable<any>): Observable<any[]> {
    const actorControlSelf$ = packets$.pipe(
      ofPacketType('actorControlSelf'),
      filter(packet => packet.category === 320)
    );

    const fishCaught$ = actorControlSelf$.pipe(
      map(packet => {
        return {
          id: packet.param1,
          hq: (packet.param3 >> 4 & 1) === 1,
          moochable: (packet.param3 & 0x0000000F) === 5,
          size: packet.param2 >> 16
        };
      })
    );

    const positionPackets$ = packets$.pipe(
      ofPacketType('updatePositionHandler'),
      debounceTime(1000)
    );

    const spot$ = combineLatest([this.eorzea.mapId$, positionPackets$]).pipe(
      filter(([mapId]) => this.lazyData.data.maps[mapId.toString()] !== undefined),
      map(([mapId, packet]) => {
        const mapData = this.lazyData.data.maps[mapId.toString()];
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
        const spots = this.lazyData.data.fishingSpots.filter(spot => spot.mapId === position.mapId);
        return spots.sort((a, b) => {
          return Math.sqrt(Math.pow(a.coords.x - position.x, 2) + Math.pow(a.coords.y - position.y, 2))
            - Math.sqrt(Math.pow(b.coords.x - position.x, 2) + Math.pow(b.coords.y - position.y, 2));
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
      startWith(false),
      shareReplay(1)
    );

    const eventPlay$ = packets$.pipe(
      ofPacketType('eventPlay'),
      filter(packet => packet.eventId === 0x150001)
    );

    const moochId$ = new BehaviorSubject<number>(null);

    packets$.pipe(
      ofPacketType('useMooch')
    ).subscribe(packet => {
      moochId$.next(packet.moochID);
    });

    const throw$ = eventPlay$.pipe(
      filter(packet => packet.scene === 1),
      withLatestFrom(
        this.eorzea.statuses$,
        this.eorzea.weatherId$,
        this.eorzea.previousWeatherId$,
        moochId$
      ),
      map(([, statuses, weatherId, previousWeatherId, mooch]) => {
        return {
          timestamp: Date.now(),
          etime: this.etime.toEorzeanDate(new Date()),
          statuses,
          weatherId,
          previousWeatherId,
          mooch
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
      ofPacketType('eventPlay4'),
      map(packet => {
        return this.lazyData.data.actionTimeline[packet.actionTimeline.toString()];
      }),
      filter(key => key !== undefined)
    );

    const mooch$ = packets$.pipe(
      ofPacketType('eventPlay8'),
      filter(packet => packet.actionTimeline === 257),
      map(packet => {
        return packet.param1 === 1121;
      })
    );

    const misses$ = combineLatest([
      packets$.pipe(
        ofPacketType('eventPlay8'),
        map(packet => {
          return {
            animation: packet.actionTimeline,
            timestamp: Date.now()
          };
        })
      ),
      bite$
    ]).pipe(
      filter(([rodAnimation, playerAnimation]) => {
        return rodAnimation.animation > 10000 && rodAnimation.animation < 10000000
          && Math.abs(rodAnimation.timestamp - playerAnimation.timestamp) < 10000;
      }),
      map(() => {
        return {
          id: -1,
          hq: false,
          size: 0
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

    /**
     * Let's subscribe everything to update the global fishing state for debug overlay.
     */
    combineLatest([
      isFishing$,
      this.eorzea.mapId$,
      this.eorzea.baitId$.pipe(startWith(null)),
      spot$.pipe(startWith(null)),
      fisherStats$.pipe(startWith(null)),
      mooch$.pipe(startWith(false)),
      this.eorzea.statuses$,
      this.eorzea.weatherId$.pipe(startWith(null), distinctUntilChanged()),
      this.eorzea.previousWeatherId$.pipe(startWith(null), distinctUntilChanged()),
      moochId$.pipe(startWith(null))
    ]).subscribe(([isFishing, mapId, baitId, spot, stats, mooch, statuses, weatherId, previousWeatherId, moochId]) => {
      this.setState({
        isFishing,
        mapId,
        baitId,
        spot,
        stats,
        mooch,
        statuses,
        weatherId,
        previousWeatherId,
        moochId
      });
    });

    return merge(misses$, fishCaught$).pipe(
      withLatestFrom(isFishing$),
      filter(([, isFishing]) => isFishing),
      map(([fishData]) => fishData),
      withLatestFrom(
        this.eorzea.mapId$,
        this.eorzea.baitId$,
        throw$,
        bite$,
        hookset$,
        spot$,
        fisherStats$,
        mooch$
      ),
      filter(([fish, , , throwData, biteData, , spot, , mooch]) => {
        return fish.id === -1 || (biteData.tug !== null &&
          spot.fishes.indexOf(fish.id) > -1
          && (!mooch || spot.fishes.indexOf(throwData.mooch) > -1));
      }),
      map(([fish, mapId, baitId, throwData, biteData, hookset, spot, stats, mooch]) => {
        const entry = {
          itemId: fish.id,
          etime: throwData.etime.getUTCHours(),
          hq: fish.hq,
          mapId,
          weatherId: throwData.weatherId,
          previousWeatherId: throwData.previousWeatherId,
          baitId,
          biteTime: Math.floor((biteData.timestamp - throwData.timestamp) / 100),
          fishEyes: throwData.statuses.indexOf(762) > -1,
          snagging: throwData.statuses.indexOf(761) > -1,
          chum: throwData.statuses.indexOf(763) > -1,
          patience: throwData.statuses.indexOf(850) > -1,
          mooch: mooch,
          tug: biteData.tug,
          hookset,
          spot: spot.id,
          size: fish.size,
          ...stats
        };
        if (mooch) {
          entry.baitId = throwData.mooch;
        }
        return [entry];
      }),
      tap(reports => {
        this.setState({
          reports: [
            ...(this.state.reports || []),
            ...reports
          ]
        });
      })
    );
  }

  getDataType(): string {
    return 'fishingresults';
  }

}
