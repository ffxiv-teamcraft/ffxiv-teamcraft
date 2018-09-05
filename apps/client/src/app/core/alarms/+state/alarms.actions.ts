import { Action } from '@ngrx/store';
import { Alarm } from '../alarm';

export enum AlarmsActionTypes {
  LoadAlarms = '[Alarms] Load Alarms',
  AlarmsLoaded = '[Alarms] Alarms Loaded',

  AddAlarms = '[Alarms] Add Alarms'
}

export class LoadAlarms implements Action {
  readonly type = AlarmsActionTypes.LoadAlarms;
}

export class AlarmsLoaded implements Action {
  readonly type = AlarmsActionTypes.AlarmsLoaded;

  constructor(public payload: Alarm[]) {
  }
}

export class AddAlarms implements Action {
  readonly type = AlarmsActionTypes.AddAlarms;

  constructor(public payload: Alarm[]) {
  }
}

export type AlarmsAction = LoadAlarms | AlarmsLoaded | AddAlarms;

export const fromAlarmsActions = {
  LoadAlarms,
  AlarmsLoaded,
  AddAlarms
};
