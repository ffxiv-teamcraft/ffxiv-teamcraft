import { DataReporter } from './data-reporter';
import { combineLatest, merge, Observable } from 'rxjs';
import { ofMessageType } from '../rxjs/of-message-type';
import { delay, distinctUntilChanged, filter, map, mapTo, shareReplay, startWith, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { EorzeaFacade } from '../../modules/eorzea/+state/eorzea.facade';
import { EorzeanTimeService } from '../eorzea/eorzean-time.service';
import { IpcService } from '../electron/ipc.service';
import { toIpcData } from '../rxjs/to-ipc-data';
import { Tug } from '@ffxiv-teamcraft/types';
import { Hookset } from '@ffxiv-teamcraft/types';
import { SettingsService } from '../../modules/settings/settings.service';
import { LazyDataFacade } from '../../lazy-data/+state/lazy-data.facade';
import { EventPlay } from '@ffxiv-teamcraft/pcap-ffxiv';
import { FishingReporterState } from './state/fishing-reporter-state';


export class FishingReporter implements DataReporter {

  private state: Partial<FishingReporterState> = {};

  constructor(private eorzea: EorzeaFacade, private lazyData: LazyDataFacade,
              private etime: EorzeanTimeService, private ipc: IpcService,
              private settings: SettingsService) {
  }

  getDataReports(_packets$: Observable<any>): Observable<any[]> {
    const packets$ = _packets$.pipe(
      filter(packet => packet.header.sourceActor === packet.header.targetActor)
    );
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

    const spot$ = this.lazyData.getEntry('fishingSpots').pipe(
      switchMap(fishingSpots => {
        return packets$.pipe(
          ofMessageType('systemLogMessage'),
          toIpcData(),
          map((packet) => {
            return fishingSpots.find(spot => spot.zoneId === packet.param3);
          }),
          filter(spot => spot !== undefined),
          tap(spot => {
            this.eorzea.setZone(spot.zoneId);
            this.eorzea.setMap(spot.mapId);
          }),
          shareReplay({ bufferSize: 1, refCount: true })
        );
      })
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
      shareReplay({ bufferSize: 1, refCount: true })
    );

    const eventPlay$: Observable<EventPlay> = packets$.pipe(
      ofMessageType('eventPlay'),
      toIpcData(),
      filter(packet => packet.eventId === 0x150001)
    );

    eventPlay$.pipe(
      filter(p => {
        return p.scene === 2;
      })
    ).subscribe(() => {
      this.setState({
        throwData: null
      });
    });

    const throw$ = eventPlay$.pipe(
      filter(packet => packet.scene === 1),
      delay(200),
      withLatestFrom(
        this.eorzea.statuses$,
        this.eorzea.weatherId$,
        this.eorzea.previousWeatherId$
      ),
      map(([, statuses, weatherId, previousWeatherId]) => {
        return {
          timestamp: Date.now(),
          etime: this.etime.toEorzeanDate(new Date()),
          statuses,
          weatherId,
          previousWeatherId
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

    const actionTimeline$ = this.lazyData.getEntry('actionTimeline').pipe(
      switchMap(actionTimeline => {
        return packets$.pipe(
          ofMessageType('eventPlay4'),
          toIpcData(),
          map((packet) => {
            return actionTimeline[packet.params[0].toString()];
          }),
          filter(key => key !== undefined)
        );
      })
    );

    const mooch$ = packets$.pipe(
      ofMessageType('systemLogMessage'),
      toIpcData(),
      filter(packet => packet.param1 === 1121 || packet.param1 === 1110),
      map(packet => {
        if (packet.param1 === 1121) {
          return packet.param3;
        }
        return null;
      }),
      startWith(null)
    );

    const misses$ = combineLatest([
      packets$.pipe(
        ofMessageType('systemLogMessage'),
        toIpcData(),
        map(packet => {
          return {
            logMessage: packet.param1,
            timestamp: Date.now()
          };
        })
      ),
      bite$
    ]).pipe(
      filter(([rodAnimation, playerAnimation]) => {
        /**
         * 1117: Ignored the fish
         * 1119: snap?
         * 1120: Fish left
         */
        return (rodAnimation.logMessage === 1119 || rodAnimation.logMessage === 1120 || rodAnimation.logMessage === 1117) && Math.abs(rodAnimation.timestamp - playerAnimation.timestamp) < 10000;
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
      throw$.pipe(startWith(null)),
      bite$.pipe(startWith(null))
    ]).subscribe(([isFishing, mapId, baitId, spot, stats, mooch, statuses, weatherId, previousWeatherId, throwData, biteData]) => {
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
      filter(([fish, , throwData, biteData, , spot, stats]) => {
        return (fish.id === -1 && stats?.gp > 1)
          || (biteData.tug !== null
            && spot.fishes.indexOf(fish.id) > -1
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
          fishEyes: throwData.statuses.includes(762),
          snagging: throwData.statuses.includes(761),
          chum: throwData.statuses.includes(763),
          patience: throwData.statuses.includes(850),
          intuition: throwData.statuses.includes(568),
          mooch: mooch !== null,
          tug: biteData.tug,
          hookset,
          spot: spot.id,
          size: fish.size,
          ...stats
        };
        if (mooch) {
          entry.baitId = mooch;
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
        if (this.settings.localFishingDataDump) {
          this.ipc.send('fishing-report', reports);
        }
      }),
      filter(([entry]) => {
        return entry.spot < 10000;
      })
    );
  }

  getDataType(): string {
    return 'fishingresults';
  }

  private setState(newState: Partial<FishingReporterState>): void {
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

}
