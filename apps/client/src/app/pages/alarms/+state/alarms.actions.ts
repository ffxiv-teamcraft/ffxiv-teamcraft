import { Action } from '@ngrx/store';
import { Entity } from './alarms.reducer';

export enum AlarmsActionTypes {
  LoadAlarms = '[Alarms] Load Alarms',
  AlarmsLoaded = '[Alarms] Alarms Loaded',
  AlarmsLoadError = '[Alarms] Alarms Load Error'
}

export class LoadAlarms implements Action {
  readonly type = AlarmsActionTypes.LoadAlarms;
}

export class AlarmsLoadError implements Action {
  readonly type = AlarmsActionTypes.AlarmsLoadError;
  constructor(public payload: any) {}
}

export class AlarmsLoaded implements Action {
  readonly type = AlarmsActionTypes.AlarmsLoaded;
  constructor(public payload: Entity[]) {}
}

export type AlarmsAction = LoadAlarms | AlarmsLoaded | AlarmsLoadError;

export const fromAlarmsActions = {
  LoadAlarms,
  AlarmsLoaded,
  AlarmsLoadError
};
