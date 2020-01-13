import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { EorzeaPartialState } from './eorzea.reducer';
import { AddStatus, RemoveStatus, SetBait, SetStatuses, SetZone } from './eorzea.actions';
import { eorzeaQuery } from './eorzea.selectors';
import { filter, map, shareReplay } from 'rxjs/operators';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { WeatherService } from '../../../core/eorzea/weather.service';
import { EorzeanTimeService } from '../../../core/eorzea/eorzean-time.service';
import { combineLatest } from 'rxjs';
import { weatherIndex } from '../../../core/data/sources/weather-index';
import { mapIds } from '../../../core/data/sources/map-ids';

@Injectable({
  providedIn: 'root'
})
export class EorzeaFacade {

  public zoneId$ = this.store.pipe(select(eorzeaQuery.getZone));

  public mapId$ = combineLatest([this.zoneId$, this.lazyData.data$]).pipe(
    map(([zoneId, data]) => {
      return +Object.keys(data.maps)
        .find(key => {
          return zoneId === data.maps[+key].placename_id;
        });
    })
  );

  public weatherId$ = combineLatest([this.etime.getEorzeanTime(), this.mapId$]).pipe(
    filter(([, mapId]) => mapId > 0),
    map(([time, mapId]) => {
      return this.weatherService.getWeather(mapId, time.getTime(), weatherIndex[mapIds.find(m => m.id === mapId).weatherRate]);
    }),
    shareReplay(1)
  );

  public previousWeatherId$ = combineLatest([this.etime.getEorzeanTime(), this.mapId$]).pipe(
    filter(([, mapId]) => mapId > 0),
    map(([time, mapId]) => {
      return this.weatherService.getWeather(mapId, time.getTime() - 8 * 3600 * 1000, weatherIndex[mapIds.find(m => m.id === mapId).weatherRate]);
    }),
    shareReplay(1)
  );

  public baitId$ = this.store.pipe(select(eorzeaQuery.getBait)).pipe(filter(baitId => baitId > 0));

  public statuses$ = this.store.pipe(select(eorzeaQuery.getStatuses));

  constructor(private store: Store<EorzeaPartialState>,
              private lazyData: LazyDataService,
              private weatherService: WeatherService,
              private etime: EorzeanTimeService) {
  }

  setZone(zoneId: number) {
    this.store.dispatch(new SetZone(zoneId));
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

  addStatus(effect: number) {
    this.store.dispatch(new AddStatus(effect));
  }
}
