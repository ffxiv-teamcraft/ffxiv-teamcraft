import { Injectable } from '@angular/core';

import { Store } from '@ngrx/store';

import { AlarmsState } from './alarms.reducer';
import { alarmsQuery } from './alarms.selectors';
import { AddAlarms, LoadAlarms, RemoveAlarm } from './alarms.actions';
import { Alarm } from '../alarm';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AlarmsFacade {

  loaded$ = this.store.select(alarmsQuery.getLoaded);
  allAlarms$ = this.store.select(alarmsQuery.getAllAlarms);

  constructor(private store: Store<{ alarms: AlarmsState }>) {
  }

  public addAlarms(alarms: Alarm[]): void {
    this.store.dispatch(new AddAlarms(alarms));
  }

  public deleteAlarm(alarm: Alarm): void {
    this.store.dispatch(new RemoveAlarm(alarm.$key));
  }

  /**
   * Only one alarm can be added for each item.
   * @param alarm
   */
  public hasAlarm(alarm: Partial<Alarm>): Observable<boolean> {
    return this.allAlarms$.pipe(
      map(alarms => alarms.find(a => a.itemId === alarm.itemId && a.zoneId === alarm.zoneId) !== undefined)
    );
  }

  public loadAlarms(): void {
    this.store.dispatch(new LoadAlarms());
  }


}
