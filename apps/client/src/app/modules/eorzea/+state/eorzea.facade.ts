import { Injectable } from '@angular/core';

import { select, Store } from '@ngrx/store';

import { EorzeaPartialState } from './eorzea.reducer';
import { SetBait, SetStatuses, SetWeather, SetZone } from './eorzea.actions';
import { eorzeaQuery } from './eorzea.selectors';
import { map } from 'rxjs/operators';
import { LazyDataService } from '../../../core/data/lazy-data.service';

@Injectable({
  providedIn: 'root'
})
export class EorzeaFacade {

  public zoneId$ = this.store.pipe(select(eorzeaQuery.getZone));

  public mapId$ = this.zoneId$.pipe(
    map(zoneId => {
      return +Object.keys(this.lazyData.maps)
        .find(key => {
          return zoneId === this.lazyData.maps[+key].placename_id;
        });
    })
  );

  constructor(private store: Store<EorzeaPartialState>,
              private lazyData: LazyDataService) {
  }

  setZone(zoneId: number) {
    this.store.dispatch(new SetZone(zoneId));
  }

  setWeather(weatherId: number) {
    this.store.dispatch(new SetWeather(weatherId));
  }

  setBait(baitId: number) {
    this.store.dispatch(new SetBait(baitId));
  }

  setStatuses(effects: number[]) {
    this.store.dispatch(new SetStatuses(effects));
  }
}
