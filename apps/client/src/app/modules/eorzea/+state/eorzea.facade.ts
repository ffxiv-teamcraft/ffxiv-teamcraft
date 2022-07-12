import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { EorzeaPartialState } from './eorzea.reducer';
import { AddStatus, RemoveStatus, SetBait, SetMap, SetPcapWeather, SetStatuses, SetZone } from './eorzea.actions';
import { eorzeaQuery } from './eorzea.selectors';
import { debounceTime, filter, first, map, shareReplay, startWith, switchMap } from 'rxjs/operators';
import { WeatherService } from '../../../core/eorzea/weather.service';
import { EorzeanTimeService } from '../../../core/eorzea/eorzean-time.service';
import { combineLatest, of } from 'rxjs';
import { weatherIndex } from '../../../core/data/sources/weather-index';
import { mapIds } from '../../../core/data/sources/map-ids';
import { IpcService } from '../../../core/electron/ipc.service';
import { AuthFacade } from '../../../+state/auth.facade';

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

  public baitId$ = this.store.pipe(select(eorzeaQuery.getBait)).pipe(filter(baitId => baitId > 0));

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
  classJobSet$ = combineLatest([this.ipc.playerStatsPackets$, this.ipc.updateClassInfoPackets$, this.soulCrystal$, this.statuses$]).pipe(
    debounceTime(500),
    switchMap(([playerStats, classInfo, soulCrystal, statuses]) => {
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
        })
      );
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor(private store: Store<EorzeaPartialState>,
              private weatherService: WeatherService,
              private etime: EorzeanTimeService,
              private ipc: IpcService,
              private authFacade: AuthFacade) {
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

  resetStatuses() {
    this.store.dispatch(new SetStatuses([]));
  }

  setStatuses(statuses: number[]) {
    this.store.dispatch(new SetStatuses(statuses));
  }

  addStatus(effect: number) {
    this.store.dispatch(new AddStatus(effect));
  }

  setPcapWeather(weatherID: number, newZone = false) {
    this.store.dispatch(new SetPcapWeather(weatherID, newZone));
  }
}
