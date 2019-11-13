import { EorzeaAction, EorzeaActionTypes } from './eorzea.actions';

export const EORZEA_FEATURE_KEY = 'eorzea';

export interface EorzeaState {
  zoneId: number,
  weatherId: number,
  previousWeatherId: number,
  baitId: number,
  statuses: number[]
}

export interface EorzeaPartialState {
  readonly [EORZEA_FEATURE_KEY]: EorzeaState;
}

export const initialState: EorzeaState = {
  zoneId: 0,
  weatherId: 0,
  previousWeatherId: 0,
  baitId: 0,
  statuses: []
};

export function eorzeaReducer(
  state: EorzeaState = initialState,
  action: EorzeaAction
): EorzeaState {
  switch (action.type) {
    case EorzeaActionTypes.SetZone: {
      state = {
        ...state,
        zoneId: action.payload
      };
      break;
    }
    case EorzeaActionTypes.SetWeather: {
      state = {
        ...state,
        previousWeatherId: state.weatherId > 0 ? state.weatherId : 0,
        weatherId: action.payload
      };
      break;
    }
    case EorzeaActionTypes.SetBait: {
      state = {
        ...state,
        baitId: action.payload
      };
      break;
    }
    case EorzeaActionTypes.SetStatuses: {
      state = {
        ...state,
        statuses: action.payload
      };
      break;
    }
  }
  return state;
}
