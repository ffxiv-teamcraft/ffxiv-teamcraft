import { Action } from '@ngrx/store';

export enum EorzeaActionTypes {
  SetZone = '[Eorzea] Set Zone',
  SetWeather = '[Eorzea] Set Weather',
}

export class SetZone implements Action {
  readonly type = EorzeaActionTypes.SetZone;

  constructor(public payload: number) {
  }
}

export class SetWeather implements Action {
  readonly type = EorzeaActionTypes.SetWeather;

  constructor(public payload: number) {
  }
}

export type EorzeaAction = SetZone | SetWeather;
