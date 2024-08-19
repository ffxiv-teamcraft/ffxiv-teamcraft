import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { EorzeaPartialState } from './eorzea.reducer';
import { AddStatus, RemoveStatus, Reset, SetBait, SetMap, SetPcapWeather, SetStatuses, SetZone } from './eorzea.actions';
import { eorzeaQuery } from './eorzea.selectors';
import { debounceTime, filter, first, map, shareReplay, startWith, switchMap } from 'rxjs/operators';
import { WeatherService } from '../../../core/eorzea/weather.service';
import { EorzeanTimeService } from '../../../core/eorzea/eorzean-time.service';
import { combineLatest, of } from 'rxjs';
import { weatherIndex } from '../../../core/data/sources/weather-index';
import { mapIds } from '../../../core/data/sources/map-ids';
import { IpcService } from '../../../core/electron/ipc.service';
import { AuthFacade } from '../../../+state/auth.facade';
import { StatusEntry } from '../status-entry';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { TeamcraftGearsetStats } from '../../../model/user/teamcraft-gearset-stats';

type StatBonus = { percent?: number, flat?: number, max?: number };

@Injectable({
  providedIn: 'root'
})
export class EorzeaFacade {

  public zoneId$ = this.store.pipe(select(eorzeaQuery.getZone));

  public mapId$ = this.store.pipe(select(eorzeaQuery.getMap));

  public weatherId$ = combineLatest([this.etime.getEorzeanTime(), this.mapId$]).pipe(
    filter(([, mapId]) => mapId > 0),
    switchMap(([time, mapId]) => {
      // Need to override for diadem
      if (mapId === 584) {
        return this.store.pipe(select(eorzeaQuery.getPcapWeather));
      }
      return of(this.weatherService.getWeather(mapId, time.getTime(), weatherIndex[mapIds.find(m => m.id === mapId).weatherRate]));
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  public previousWeatherId$ = combineLatest([this.etime.getEorzeanTime(), this.mapId$]).pipe(
    filter(([, mapId]) => mapId > 0),
    switchMap(([time, mapId]) => {
      // Need to override for diadem
      if (mapId === 584) {
        return this.store.pipe(select(eorzeaQuery.getPreviouPcapWeather));
      }
      return of(this.weatherService.getWeather(mapId, time.getTime() - 8 * 3600 * 1000, weatherIndex[mapIds.find(m => m.id === mapId).weatherRate]));
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  public baitId$ = this.store.pipe(select(eorzeaQuery.getBait));

  public statuses$ = this.store.pipe(select(eorzeaQuery.getStatuses));

  private soulCrystal$ = this.ipc.itemInfoPackets$.pipe(
    filter(packet => {
      return packet.catalogId >= 10337 && packet.catalogId <= 10344 && packet.slot === 13 && packet.containerId === 1000;
    }),
    startWith({
      catalogId: 0
    })
  );

  /**
   * Emits the current stats set mapped using the ingame packets on classjob switch, useful to update stats
   */
  classJobSet$ = combineLatest([this.ipc.playerStatsPackets$, this.ipc.updateClassInfoPackets$, this.soulCrystal$, this.statuses$, this.lazyData.getEntry('foods'), this.lazyData.getEntry('medicines')]).pipe(
    debounceTime(1000),
    switchMap(([playerStats, classInfo, soulCrystal, statuses, foods, medicines]) => {
      const consumables = [...foods, ...medicines];
      return this.authFacade.gearSets$.pipe(
        first(),
        map(sets => {
          return sets.find(set => set.jobId === classInfo.classId);
        }),
        filter(set => set !== undefined),
        map(set => {
          return {
            ...set,
            level: classInfo.level,
            cp: playerStats.cp,
            control: playerStats.control,
            craftsmanship: playerStats.craftsmanship,
            specialist: soulCrystal.catalogId === set.jobId + 10329
          };
        }),
        map(stats => {
          const wellFed = statuses.find(({ id }) => id === 48);
          const medicated = statuses.find(({ id }) => id === 49);
          const bonuses: Partial<Record<keyof TeamcraftGearsetStats, Array<StatBonus>>> = {
            cp: [],
            control: [],
            craftsmanship: []
          };
          [wellFed, medicated].filter(Boolean).forEach(buff => {
            const hq = buff.param > 10000;
            const food = consumables.find(f => f.itemFood === buff.param % 10000);
            Object.keys(food.Bonuses).forEach(bonusKey => {
              if (['CP', 'Craftsmanship', 'Control'].includes(bonusKey)) {
                const bonus = food.Bonuses[bonusKey];
                if (bonus) {
                  const value = hq ? bonus.ValueHQ : bonus.Value;
                  const max = hq ? bonus.MaxHQ : bonus.Max;
                  if (bonus.Relative) {
                    bonuses[bonusKey.toLowerCase()].push({
                      percent: value,
                      max: max
                    });
                  } else {
                    bonuses[bonusKey.toLowerCase()].push({
                      flat: value
                    });
                  }
                }
              }
            });
          });
          Object.entries(bonuses).forEach(([stat, rows]: ['cp' | 'craftsmanship' | 'control', StatBonus[]]) => {
            rows.filter(b => b.flat).forEach(flatBonus => stats[stat] -= flatBonus.flat);
            const realBonuses = rows.filter(b => b.percent);
            // Let's bruteforce starting at lowest possible result
            let startingValue = realBonuses.reduce((acc, bonus) => acc - bonus.max, stats[stat]);
            let buffed = this.getBuffedValue(startingValue, realBonuses);
            while (buffed < stats[stat]) {
              startingValue++;
              buffed = this.getBuffedValue(startingValue, realBonuses);
            }
            // We got our result
            stats[stat] = startingValue;
          });
          return stats;
        })
      );
    }),
    filter(Boolean),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor(private store: Store<EorzeaPartialState>,
              private weatherService: WeatherService,
              private etime: EorzeanTimeService,
              private ipc: IpcService,
              private authFacade: AuthFacade,
              private lazyData: LazyDataFacade) {
    this.ipc.mainWindowState$.subscribe(state => {
      if (state.eorzea?.mapId) {
        this.setMap(state.eorzea.mapId);
        this.setZone(state.eorzea.zoneId);
      }
    });
  }

  getBuffedValue(startingValue: number, buffs: StatBonus[]): number {
    return buffs.reduce((acc, buff) => {
      return acc + Math.min(buff.max, Math.floor(startingValue * (1 + buff.percent / 100)));
    }, startingValue);
  }

  reset(): void {
    this.store.dispatch(new Reset());
  }

  setZone(zoneId: number) {
    this.store.dispatch(new SetZone(zoneId));
  }

  setMap(mapId: number) {
    this.store.dispatch(new SetMap(mapId));
  }

  setBait(baitId: number) {
    this.store.dispatch(new SetBait(baitId));
  }

  removeStatus(effect: number) {
    this.store.dispatch(new RemoveStatus(effect));
  }

  setStatuses(statuses: StatusEntry[]) {
    this.store.dispatch(new SetStatuses(statuses));
  }

  addStatus(effect: StatusEntry) {
    this.store.dispatch(new AddStatus(effect));
  }

  setPcapWeather(weatherID: number, newZone = false) {
    this.store.dispatch(new SetPcapWeather(weatherID, newZone));
  }
}
