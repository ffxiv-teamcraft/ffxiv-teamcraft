import { Action } from '@ngrx/store';
import { Alarm } from '../alarm';
import { AlarmGroup } from '../alarm-group';

export enum AlarmsActionTypes {
  LoadAlarms = '[Alarms] Load Alarms',
  AlarmsLoaded = '[Alarms] Alarms Loaded',

  AddAlarms = '[Alarms] Add Alarms',
  AddAlarmsAndGroup = '[Alarms] Add alarms and group',
  AlarmsCreated = '[Alarms] Alarms created',
  UpdateAlarm = '[Alarms] Update Alarm',
  RemoveAlarm = '[Alarms] Remove Alarm',

  PersistAlarms = '[Alarms] Persist Alarms',

  SetAlarms = '[Alarms] Set Alarms',
  SetGroups = '[Alarms] Set Groups',

  CreateAlarmGroup = '[Alarms] Create Group',
  UpdateAlarmGroup = '[Alarms] Update Group',
  DeleteAlarmGroup = '[Alarms] Delete Group',
  AssignGroupToAlarm = '[Alarms] Assign Group To Alarm',

  LoadAlarmGroup = '[Alarms] Load external alarm group',
  AlarmGroupLoaded = '[Alarms] External alarm group Loaded',
  DeleteAllAlarms = '[Alarms] Delete all alarms',
}

export class LoadAlarms implements Action {
  readonly type = AlarmsActionTypes.LoadAlarms;
}

export class AlarmsLoaded implements Action {
  readonly type = AlarmsActionTypes.AlarmsLoaded;

  constructor(public readonly alarms: Alarm[], public readonly groups: AlarmGroup[]) {
  }
}

export class AddAlarms implements Action {
  readonly type = AlarmsActionTypes.AddAlarms;

  constructor(public payload: Alarm[]) {
  }
}

export class AddAlarmsAndGroup implements Action {
  readonly type = AlarmsActionTypes.AddAlarmsAndGroup;

  constructor(public payload: Alarm[], public groupName: string, public redirect = false) {
  }
}

export class AlarmsCreated implements Action {
  readonly type = AlarmsActionTypes.AlarmsCreated;

  constructor(public readonly amount: number) {
  }
}

export class UpdateAlarm implements Action {
  readonly type = AlarmsActionTypes.UpdateAlarm;

  constructor(public readonly alarm: Alarm) {
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

export class SetAlarms implements Action {
  readonly type = AlarmsActionTypes.SetAlarms;

  constructor(public readonly alarms: Alarm[]) {
  }
}

// Group-related actions
export class CreateAlarmGroup implements Action {
  readonly type = AlarmsActionTypes.CreateAlarmGroup;

  constructor(public readonly name: string, public readonly index: number, public readonly initialContent: string[] = []) {
  }
}

export class SetGroups implements Action {
  readonly type = AlarmsActionTypes.SetGroups;

  constructor(public readonly groups: AlarmGroup[]) {
  }
}

export class UpdateAlarmGroup implements Action {
  readonly type = AlarmsActionTypes.UpdateAlarmGroup;

  constructor(public readonly group: Partial<AlarmGroup>) {
  }
}

export class DeleteAlarmGroup implements Action {
  readonly type = AlarmsActionTypes.DeleteAlarmGroup;

  constructor(public readonly id: string) {
  }
}

export class AssignGroupToAlarm implements Action {
  readonly type = AlarmsActionTypes.AssignGroupToAlarm;

  constructor(public readonly alarmId: string, public readonly groupId: string) {
  }
}

export class DeleteAllAlarms implements Action {
  readonly type = AlarmsActionTypes.DeleteAllAlarms;
}

export class LoadAlarmGroup implements Action {
  readonly type = AlarmsActionTypes.LoadAlarmGroup;

  constructor(public readonly key: string) {
  }
}

export class AlarmGroupLoaded implements Action {
  readonly type = AlarmsActionTypes.AlarmGroupLoaded;

  constructor(public readonly group: AlarmGroup, public readonly alarms: Alarm[]) {
  }
}

export type AlarmsAction =
  LoadAlarms
  | AlarmsLoaded
  | AddAlarms
  | UpdateAlarm
  | PersistAlarms
  | RemoveAlarm
  | CreateAlarmGroup
  | UpdateAlarmGroup
  | DeleteAlarmGroup
  | AssignGroupToAlarm
  | AlarmsCreated
  | LoadAlarmGroup
  | AlarmGroupLoaded
  | SetAlarms
  | SetGroups;
