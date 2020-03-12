import { createFeatureSelector, createSelector } from '@ngrx/store';
import { EORZEA_FEATURE_KEY, EorzeaState } from './eorzea.reducer';

// Lookup the 'Eorzea' feature state managed by NgRx
const getEorzeaState = createFeatureSelector<EorzeaState>(EORZEA_FEATURE_KEY);

const getZone = createSelector(
  getEorzeaState,
  (state: EorzeaState) => state.zoneId
);

const getMap = createSelector(
  getEorzeaState,
  (state: EorzeaState) => state.mapId
);

const getPcapWeather = createSelector(
  getEorzeaState,
  (state: EorzeaState) => state.pcapWeather
);

const getPreviouPcapWeather = createSelector(
  getEorzeaState,
  (state: EorzeaState) => state.previousPcapWeather
);

const getBait = createSelector(
  getEorzeaState,
  (state: EorzeaState) => state.baitId
);

const getStatuses = createSelector(
  getEorzeaState,
  (state: EorzeaState) => state.statuses
);


export const eorzeaQuery = {
  getZone,
  getMap,
  getPcapWeather,
  getPreviouPcapWeather,
  getBait,
  getStatuses
};
