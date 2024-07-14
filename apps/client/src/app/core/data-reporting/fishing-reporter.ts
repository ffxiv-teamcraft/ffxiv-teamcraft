import { DataReporter } from './data-reporter';
import { BehaviorSubject, combineLatest, merge, Observable, Subject } from 'rxjs';
import { ofMessageType } from '../rxjs/of-message-type';
import { debounceTime, delay, distinctUntilChanged, filter, map, shareReplay, startWith, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { EorzeaFacade } from '../../modules/eorzea/+state/eorzea.facade';
import { EorzeanTimeService } from '../eorzea/eorzean-time.service';
import { IpcService } from '../electron/ipc.service';
import { toIpcData } from '../rxjs/to-ipc-data';
import { Hookset, Region, Tug } from '@ffxiv-teamcraft/types';
import { SettingsService } from '../../modules/settings/settings.service';
import { LazyDataFacade } from '../../lazy-data/+state/lazy-data.facade';
import type { EventPlay } from '@ffxiv-teamcraft/pcap-ffxiv/models';
import { FishingReporterState } from './state/fishing-reporter-state';
import { FishTrainFacade } from '../../modules/fish-train/fish-train/fish-train.facade';
import { getFishTrainStatus } from '../../modules/fish-train/get-fish-train-status';
import { FishTrainStatus } from '../../pages/fish-trains/fish-trains/fish-train-status';
import { FishingReport } from './fishing-report';
import { AuthFacade } from '../../+state/auth.facade';
import { LazyFishingSpot } from '@ffxiv-teamcraft/data/model/lazy-fishing-spot';


export class FishingReporter implements DataReporter {

  private state: Partial<FishingReporterState> = {};

  private pcapStopped$ = this.ipc.pcapStopped$;

  constructor(private eorzea: EorzeaFacade, private lazyData: LazyDataFacade,
              private etime: EorzeanTimeService, private ipc: IpcService,
              private settings: SettingsService, private fishTrainFacade: FishTrainFacade,
              private authFacade: AuthFacade) {
    if (this.ipc.pcapToggle) {
      this.fishTrainFacade.loadRunning();
    }
    this.pcapStopped$.subscribe(() => {
      this.state = {};
      this.setState({});
      this.eorzea.reset();
    });
  }

  getDataReports(_packets$: Observable<any>): Observable<any[]> {
    const _mapId$ = new BehaviorSubject(0);
    const mapId$ = merge(_mapId$, this.eorzea.mapId$);

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

    const spotOverride$ = new Subject<LazyFishingSpot | null>();

    const _spot$ = this.lazyData.getEntry('fishingSpots').pipe(
      switchMap(fishingSpots => {
        return packets$.pipe(
          ofMessageType('systemLogMessage'),
          toIpcData(),
          filter(packet => packet.eventId === 0x150001),
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

    const spot$ = merge(spotOverride$, _spot$);

    const isFishing$ = merge(
      packets$.pipe(ofMessageType('eventStart')),
      packets$.pipe(ofMessageType('eventFinish'))
    ).pipe(
      filter(packet => packet.parsedIpcData.eventId === 0x150001),
      map(packet => {
        return packet.type === 'eventStart';
      }),
      tap(isFishing => {
        if (!isFishing) {
          _mapId$.next(0);
          spotOverride$.next(null);
        }
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

    const throw$ = packets$.pipe(
      // TODO DT flag for KR/CN
      ofMessageType(this.settings.region === Region.Global ? 'eventPlay4' : 'eventPlay'),
      toIpcData(),
      filter(packet => packet.eventId === 0x150001 && packet.scene === 1),
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
      withLatestFrom(this.eorzea.statuses$),
      map(([packet, statuses]) => {
        return {
          timestamp: Date.now(),
          tug: this.getTug(packet.param5),
          statuses
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

    const moochSelection$ = packets$.pipe(
      ofMessageType('systemLogMessage'),
      toIpcData(),
      // 1121: Cast with hooked fish
      // 3522: You apply <bait> to your line
      // 1129: Nothing bites
      filter(packet => [1121, 3522, 1129].includes(packet.param1)),
      map(packet => {
        if (packet.param1 === 1121 || packet.param1 === 3522) {
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

    const resetMooch$ = merge(packets$.pipe(
        ofMessageType('actorControlSelf', 'fishingBaitMsg')
      ),
      misses$,
      fishCaught$.pipe(debounceTime(750))
    ).pipe(
      map(() => null)
    );

    const mooch$ = merge(moochSelection$, resetMooch$);

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
      packets$.pipe(ofMessageType('logout'), map(() => null))
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
      mapId$,
      this.eorzea.baitId$,
      spot$.pipe(startWith(null)),
      fisherStats$.pipe(startWith(null)),
      mooch$,
      this.eorzea.statuses$,
      this.eorzea.weatherId$.pipe(startWith(null), distinctUntilChanged()),
      this.eorzea.previousWeatherId$.pipe(startWith(null), distinctUntilChanged()),
      throw$.pipe(startWith(null)),
      bite$.pipe(startWith(null)),
      this.fishTrainFacade.currentTrain$.pipe(startWith(null)),
      this.fishTrainFacade.currentTrainSpotId$.pipe(startWith(null))
    ]).subscribe(([isFishing, mapId, baitId, spot, stats, mooch, statuses, weatherId, previousWeatherId, throwData, biteData, train, trainSpotId]) => {
      const shouldAddTrain = trainSpotId === spot?.id && getFishTrainStatus(train) === FishTrainStatus.RUNNING;
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
        biteData,
        train: shouldAddTrain ? train : null,
        wrongSpot: spot && train && getFishTrainStatus(train) === FishTrainStatus.RUNNING && trainSpotId !== spot?.id
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
        mooch$,
        this.fishTrainFacade.currentTrainSpotId$.pipe(startWith(null)),
        this.fishTrainFacade.currentTrain$.pipe(startWith(null)),
        this.authFacade.mainCharacter$.pipe(
          map(char => char?.Name),
          startWith(null)
        )
      ),
      filter(([fish, baitId, throwData, biteData, , spot, stats]) => {
        return (fish.id === -1 && stats?.gp > 1)
          || (biteData.tug !== null
            && spot.fishes.indexOf(fish.id) > -1
          ) && throwData.weatherId !== null && baitId > 0;
      }),
      map(([fish, baitId, throwData, biteData, hookset, spot, stats, mooch, trainSpotId, train, name]) => {
        const shouldAddTrain = trainSpotId === spot?.id && getFishTrainStatus(train) === FishTrainStatus.RUNNING;
        const entry: FishingReport = {
          itemId: fish.id,
          etime: Math.round(throwData.etime.getTime() % 86400000 / 3600) / 1000,
          hq: fish.hq,
          mapId: spot.mapId,
          weatherId: throwData.weatherId,
          previousWeatherId: throwData.previousWeatherId,
          baitId,
          biteTime: Math.floor((biteData.timestamp - throwData.timestamp) / 100),
          fishEyes: throwData.statuses.some(({ id }) => id === 762),
          snagging: throwData.statuses.some(({ id }) => id === 761),
          chum: throwData.statuses.some(({ id }) => id === 763),
          patience: throwData.statuses.some(({ id }) => id === 850),
          intuition: throwData.statuses.some(({ id }) => id === 568),
          aLure: biteData.statuses.find(({ id }) => id === 3972)?.stacks || 0,
          mLure: biteData.statuses.find(({ id }) => id === 3973)?.stacks || 0,
          mooch: mooch !== null,
          tug: biteData.tug,
          hookset,
          spot: spot.id,
          size: fish.size,
          trainId: shouldAddTrain ? train?.$key : null,
          ...stats
        };
        if (mooch) {
          entry.baitId = mooch;
        }
        if (entry.trainId) {
          this.fishTrainFacade.addReport({
            size: entry.size,
            mooch: entry.mooch,
            baitId: entry.baitId,
            itemId: entry.itemId,
            trainId: entry.trainId,
            name: name || 'Anonymous',
            date: Date.now()
          });
        }
        return [entry];
      }),
      tap(([report]) => {
        this.setState({
          reports: [
            ...(this.state.reports || []),
            report
          ]
        });
        if (this.settings.localFishingDataDump) {
          this.ipc.send('fishing-report', [report]);
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
