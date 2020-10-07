import { GearsetsAction, GearsetsActionTypes } from './gearsets.actions';
import { TeamcraftGearset } from '../../../model/gearset/teamcraft-gearset';
import { GearsetProgression } from '../../../model/gearset/gearset-progression';

export const GEARSETS_FEATURE_KEY = 'gearsets';

/**
 * Interface for the 'Gearsets' data used in
 *  - GearsetsState, and the reducer function
 *
 *  Note: replace if already defined in another module
 */

export interface GearsetsState {
  list: TeamcraftGearset[]; // list of Gearsets; analogous to a sql normalized table
  progression: Record<string, GearsetProgression>; // list of Gearset progressions; analogous to a sql normalized table
  selectedId?: string; // which Gearsets record has been selected
  loaded: boolean; // has the Gearsets list been loaded
}

export interface GearsetsPartialState {
  readonly [GEARSETS_FEATURE_KEY]: GearsetsState;
}

export const initialState: GearsetsState = {
  list: [],
  progression: {},
  loaded: false
};

export function reducer(
  state: GearsetsState = initialState,
  action: GearsetsAction
): GearsetsState {
  switch (action.type) {
    case GearsetsActionTypes.GearsetsLoaded: {
      return {
        ...state,
        list: [
          ...state.list.filter(folder => !action.payload.some(s => s.$key === folder.$key)),
          ...action.payload
        ],
        loaded: true
      };
    }

    case GearsetsActionTypes.GearsetLoaded: {
      return {
        ...state,
        list: [
          ...state.list.filter(g => g.$key !== action.payload.$key),
          action.payload
        ]
      };
    }

    case GearsetsActionTypes.GearsetProgressionLoaded: {
      return {
        ...state,
        progression: {
          ...state.progression,
          [action.key]: action.payload
        }
      };
    }

    case GearsetsActionTypes.SaveGearsetProgression: {
      return {
        ...state,
        progression: {
          ...state.progression,
          [action.key]: action.progression
        }
      };
    }

    case GearsetsActionTypes.SelectGearset: {
      return {
        ...state,
        selectedId: action.key
      };
    }

    case GearsetsActionTypes.UpdateGearset: {
      return {
        ...state,
        list: [
          ...state.list.map(gearset => gearset.$key === action.key ? action.gearset : gearset)
        ]
      };
    }

    case GearsetsActionTypes.DeleteGearset: {
      return {
        ...state,
        list: [
          ...state.list.filter(gearset => gearset.$key !== action.key)
        ]
      };
    }
  }
  return state;
}
