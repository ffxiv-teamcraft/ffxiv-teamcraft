import { AlarmsAction, AlarmsActionTypes } from './alarms.actions';
import { PersistedAlarm } from '../persisted-alarm';
import { AlarmGroup } from '../alarm-group';

export interface AlarmsState {
  alarms: PersistedAlarm[];
  groups: AlarmGroup[];
  externalGroup: AlarmGroup;
  externalGroupAlarms: PersistedAlarm[];
  loaded: boolean;
}

export const initialState: AlarmsState = {
  alarms: [],
  groups: [],
  externalGroup: null,
  externalGroupAlarms: [],
  loaded: false
};

export function alarmsReducer(
  state: AlarmsState = initialState,
  action: AlarmsAction): AlarmsState {
  switch (action.type) {
    case AlarmsActionTypes.AlarmsLoaded:
      return {
        ...state,
        alarms: action.alarms,
        groups: action.groups,
        loaded: true
      };


    case AlarmsActionTypes.AlarmGroupLoaded:
      return {
        ...state,
        externalGroup: action.group,
        externalGroupAlarms: action.alarms
      };


    case AlarmsActionTypes.AddAlarms:
      return {
        ...state,
        alarms: [...state.alarms, ...action.payload]
      };

    case AlarmsActionTypes.UpdateAlarm:
      return {
        ...state,
        alarms: [...state.alarms.map(alarm => {
          if (alarm.$key === action.alarm.$key) {
            Object.assign(alarm, action.alarm);
          }
          return alarm;
        })]
      };

    case AlarmsActionTypes.RemoveAlarm:
      return {
        ...state,
        alarms: [...state.alarms.filter(alarm => alarm.$key !== action.id)]
      };

    case AlarmsActionTypes.CreateAlarmGroup:
      return {
        ...state,
        groups: [...state.groups, new AlarmGroup(action.name, action.index)]
      };

    case AlarmsActionTypes.UpdateAlarmGroup:
      return {
        ...state,
        groups: [...state.groups.map(group => {
          if (group.$key === action.group.$key) {
            Object.assign(group, action.group);
          }
          return group;
        })]
      };

    case AlarmsActionTypes.DeleteAlarmGroup:
      return {
        ...state,
        groups: [...state.groups.filter(group => group.$key !== action.id)]
      };

    case AlarmsActionTypes.AssignGroupToAlarm:
      return {
        ...state,
        groups: [...state.groups.map(group => {
          if (group.$key === action.groupId) {
            group.alarms.push(action.alarmId);
          }
          return group;
        })]
      };

    case AlarmsActionTypes.SetAlarmDone:
      return {
        ...state,
        alarms: [...state.alarms.map(alarm => {
          if (alarm.$key === action.key) {
            return {
              ...alarm
            };
          }
          return alarm;
        })]
      };
  }
  return state;
}
