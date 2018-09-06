import { Injectable } from '@angular/core';

import { Store } from '@ngrx/store';

import { AlarmsState } from './alarms.reducer';
import { alarmsQuery } from './alarms.selectors';
import { AddAlarms, LoadAlarms } from './alarms.actions';
import { Alarm } from '../alarm';

@Injectable()
export class AlarmsFacade {

  loaded$ = this.store.select(alarmsQuery.getLoaded);
  allAlarms$ = this.store.select(alarmsQuery.getAllAlarms);

  constructor(private store: Store<{ alarms: AlarmsState }>) {
  }

  public addAlarms(alarms: Alarm[]): void {
    this.store.dispatch(new AddAlarms(alarms));
  }

  public loadAlarms(): void {
    this.store.dispatch(new LoadAlarms());
  }


}
