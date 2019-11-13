import { Action } from '@ngrx/store';

export enum EorzeaActionTypes {
  SetZone = '[Eorzea] Set Zone',
  SetWeather = '[Eorzea] Set Weather',
  SetBait = '[Eorzea] Set Bait',
  SetStatuses = '[Eorzea] Set Statuses',
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

export class SetBait implements Action {
  readonly type = EorzeaActionTypes.SetBait;

  constructor(public payload: number) {
  }
}

export class SetStatuses implements Action {
  readonly type = EorzeaActionTypes.SetStatuses;

  constructor(public payload: number[]) {
  }
}

export type EorzeaAction = SetZone | SetWeather | SetBait | SetStatuses;
