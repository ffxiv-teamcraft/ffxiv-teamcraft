import { Action } from '@ngrx/store';
import { Alarm } from '../alarm';

export enum AlarmsActionTypes {
  LoadAlarms = '[Alarms] Load Alarms',
  AlarmsLoaded = '[Alarms] Alarms Loaded',

  AddAlarms = '[Alarms] Add Alarms',
  RemoveAlarm = '[Alarms] Remove Alarm',

  PersistAlarms = '[Alarms] Persist Alarms'
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

export class RemoveAlarm implements Action {
  readonly type = AlarmsActionTypes.RemoveAlarm;

  constructor(public readonly id: string) {
  }
}

export class PersistAlarms implements Action {
  readonly type = AlarmsActionTypes.PersistAlarms;
}

export type AlarmsAction = LoadAlarms | AlarmsLoaded | AddAlarms | PersistAlarms | RemoveAlarm;

export const fromAlarmsActions = {
  LoadAlarms,
  AlarmsLoaded,
  AddAlarms,
  PersistAlarms,
  RemoveAlarm
};
