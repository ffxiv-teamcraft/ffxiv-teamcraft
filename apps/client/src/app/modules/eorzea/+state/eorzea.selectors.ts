import { createFeatureSelector, createSelector } from '@ngrx/store';
import { EORZEA_FEATURE_KEY, EorzeaState } from './eorzea.reducer';

// Lookup the 'Eorzea' feature state managed by NgRx
const getEorzeaState = createFeatureSelector<EorzeaState>(EORZEA_FEATURE_KEY);

const getZone = createSelector(
  getEorzeaState,
  (state: EorzeaState) => state.zoneId
);

const getWeather = createSelector(
  getEorzeaState,
  (state: EorzeaState) => state.weatherId
);


export const eorzeaQuery = {
  getZone,
  getWeather
};
