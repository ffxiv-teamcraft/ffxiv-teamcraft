import { Action } from '@ngrx/store';
import { StatusEntry } from '../status-entry';

export enum EorzeaActionTypes {
  Reset = '[Eorzea] Reset',
  SetZone = '[Eorzea] Set Zone',
  SetMap = '[Eorzea] Set Map',
  SetPcapWeather = '[Eorzea] Set Weather',
  SetBait = '[Eorzea] Set Bait',
  RemoveStatus = '[Eorzea] Remove Status',
  AddStatus = '[Eorzea] Add Status',
  SetStatuses = '[Eorzea] Set Statuses',
}

export class Reset implements Action {
  readonly type = EorzeaActionTypes.Reset;
}

export class SetZone implements Action {
  readonly type = EorzeaActionTypes.SetZone;

  constructor(public payload: number) {
  }
}

export class SetMap implements Action {
  readonly type = EorzeaActionTypes.SetMap;

  constructor(public payload: number) {
  }
}

export class SetPcapWeather implements Action {
  readonly type = EorzeaActionTypes.SetPcapWeather;

  constructor(public weatherId: number, public newZone: boolean) {
  }
}

export class SetBait implements Action {
  readonly type = EorzeaActionTypes.SetBait;

  constructor(public payload: number) {
  }
}

export class RemoveStatus implements Action {
  readonly type = EorzeaActionTypes.RemoveStatus;

  constructor(public payload: number) {
  }
}

export class AddStatus implements Action {
  readonly type = EorzeaActionTypes.AddStatus;

  constructor(public payload: StatusEntry) {
  }
}

export class SetStatuses implements Action {
  readonly type = EorzeaActionTypes.SetStatuses;

  constructor(public payload: StatusEntry[]) {
  }
}

export type EorzeaAction = SetZone | SetMap | SetPcapWeather | SetBait | RemoveStatus | AddStatus | SetStatuses | Reset;
