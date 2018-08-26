import { AlarmsAction, AlarmsActionTypes } from './alarms.actions';

/**
 * Interface for the 'Alarms' data used in
 *  - AlarmsState, and
 *  - alarmsReducer
 *
 *  Note: replace if already defined in another module
 */

/* tslint:disable:no-empty-interface */
export interface Entity {}

export interface AlarmsState {
  list: Entity[]; // list of Alarms; analogous to a sql normalized table
  selectedId?: string | number; // which Alarms record has been selected
  loaded: boolean; // has the Alarms list been loaded
  error?: any; // last none error (if any)
}

export const initialState: AlarmsState = {
  list: [],
  loaded: false
};

export function alarmsReducer(
  state: AlarmsState = initialState,
  action: AlarmsAction
): AlarmsState {
  switch (action.type) {
    case AlarmsActionTypes.AlarmsLoaded: {
      state = {
        ...state,
        list: action.payload,
        loaded: true
      };
      break;
    }
  }
  return state;
}
