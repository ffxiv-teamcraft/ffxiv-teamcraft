import { AlarmsAction, AlarmsActionTypes } from './alarms.actions';
import { Alarm } from '../alarm';

export interface AlarmsState {
  alarms: Alarm[];
  loaded: boolean;
}

export const initialState: AlarmsState = {
  alarms: [],
  loaded: false
};

export function alarmsReducer(
  state: AlarmsState = initialState,
  action: AlarmsAction): AlarmsState {
  switch (action.type) {
    case AlarmsActionTypes.AlarmsLoaded:
      return {
        ...state,
        alarms: action.payload,
        loaded: true
      };

    case AlarmsActionTypes.AddAlarms:
      return {
        ...state,
        alarms: [...state.alarms, ...action.payload]
      };
  }
  return state;
}
