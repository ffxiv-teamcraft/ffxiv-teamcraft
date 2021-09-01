import { DataReporter } from './data-reporter';
import { BehaviorSubject, combineLatest, merge, Observable } from 'rxjs';
import { ofMessageType } from '../rxjs/of-message-type';
import { delay, distinctUntilChanged, filter, map, mapTo, shareReplay, startWith, tap, withLatestFrom } from 'rxjs/operators';
import { EorzeaFacade } from '../../modules/eorzea/+state/eorzea.facade';
import { LazyDataService } from '../data/lazy-data.service';
import { EorzeanTimeService } from '../eorzea/eorzean-time.service';
import { IpcService } from '../electron/ipc.service';
import { toIpcData } from '../rxjs/to-ipc-data';

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
      ofMessageType('actorControlSelf'),
      toIpcData(),
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

    const spot$ = packets$.pipe(
      ofMessageType('someDirectorUnk4'),
      toIpcData(),
      map((packet) => {
        return this.lazyData.data.fishingSpots.find(spot => spot.zoneId === packet.param3);
      }),
      filter(spot => spot !== undefined),
      tap(spot => {
        this.eorzea.setZone(spot.zoneId);
        this.eorzea.setMap(spot.mapId);
      }),
      shareReplay(1)
    );

    const isFishing$ = merge(
      packets$.pipe(ofMessageType('eventStart')),
      packets$.pipe(ofMessageType('eventFinish'))
    ).pipe(
      filter(packet => packet.parsedIpcData.eventId === 0x150001),
      map(packet => {
        return packet.type === 'eventStart';
      }),
      startWith(false),
      shareReplay(1)
    );

    const eventPlay$ = packets$.pipe(
      ofMessageType('eventPlay'),
      toIpcData(),
      filter(packet => packet.eventId === 0x150001)
    );

    const moochId$ = new BehaviorSubject<number>(null);

    packets$.pipe(
      ofMessageType('inventoryTransaction'),
      toIpcData(),
      withLatestFrom(isFishing$),
      filter(([, isFishing]) => isFishing),
      map(([packet]) => packet)
    ).subscribe(packet => {
      moochId$.next(packet.catalogId);
    });

    const throw$ = eventPlay$.pipe(
      filter(packet => packet.scene === 1),
      delay(200),
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
      ofMessageType('eventPlay4'),
      toIpcData(),
      map(packet => {
        return this.lazyData.data?.actionTimeline[packet.params[0].toString()];
      }),
      filter(key => key !== undefined)
    );

    const mooch$ = packets$.pipe(
      ofMessageType('someDirectorUnk4'),
      toIpcData(),
      filter(packet => packet.actionTimeline === 257 || packet.actionTimeline === 3073),
      map(packet => {
        return packet.param1 === 1121;
      }),
      startWith(false)
    );

    const misses$ = combineLatest([
      packets$.pipe(
        ofMessageType('someDirectorUnk4'),
        toIpcData(),
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
        return rodAnimation.animation === 0 && Math.abs(rodAnimation.timestamp - playerAnimation.timestamp) < 10000;
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

    const playerStats$ = merge(
      packets$.pipe(ofMessageType('playerStats'), toIpcData()),
      packets$.pipe(ofMessageType('logout'), mapTo(null))
    );

    const fisherStats$ = combineLatest([
      playerStats$,
      packets$.pipe(ofMessageType('updateClassInfo'), toIpcData())
    ]).pipe(
      filter(([, classInfo]) => {
        return classInfo.classId === 18;
      }),
      map(([stats]) => {
        return stats ? {
          gathering: stats.gathering,
          perception: stats.perception,
          gp: stats.gp
        } : null;
      })
    );

    /**
     * Reset the state when user changes character
     */
    packets$.pipe(
      ofMessageType('logout'),
      toIpcData()
    ).subscribe(() => {
      this.state = {};
      this.setState({});
    });

    /**
     * Let's subscribe everything to update the global fishing state for debug overlay.
     */
    combineLatest([
      isFishing$,
      this.eorzea.mapId$,
      this.eorzea.baitId$.pipe(startWith(null)),
      spot$.pipe(startWith(null)),
      fisherStats$.pipe(startWith(null)),
      mooch$,
      this.eorzea.statuses$,
      this.eorzea.weatherId$.pipe(startWith(null), distinctUntilChanged()),
      this.eorzea.previousWeatherId$.pipe(startWith(null), distinctUntilChanged()),
      moochId$.pipe(startWith(null)),
      throw$.pipe(startWith(null)),
      bite$.pipe(startWith(null))
    ]).subscribe(([isFishing, mapId, baitId, spot, stats, mooch, statuses, weatherId, previousWeatherId, moochId, throwData, biteData]) => {
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
        moochId,
        throwData,
        biteData
      });
    });

    return merge(misses$, fishCaught$).pipe(
      withLatestFrom(isFishing$),
      filter(([, isFishing]) => isFishing),
      map(([fishData]) => fishData),
      withLatestFrom(
        this.eorzea.baitId$,
        throw$,
        bite$,
        hookset$,
        spot$,
        fisherStats$,
        mooch$
      ),
      filter(([fish, , throwData, biteData, , spot, stats, mooch]) => {
        return (fish.id === -1 && stats?.gp > 1)
          || (biteData.tug !== null
            && spot.fishes.indexOf(fish.id) > -1
            && (!mooch || spot.fishes.indexOf(throwData.mooch) > -1)
          ) && throwData.weatherId !== null;
      }),
      map(([fish, baitId, throwData, biteData, hookset, spot, stats, mooch]) => {
        const entry = {
          itemId: fish.id,
          etime: throwData.etime.getUTCHours(),
          hq: fish.hq,
          mapId: spot.mapId,
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
