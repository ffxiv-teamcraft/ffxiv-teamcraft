import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AlarmsState } from './alarms.reducer';

// Lookup the 'Alarms' feature state managed by NgRx
const getAlarmsState = createFeatureSelector<AlarmsState>('alarms');

const getLoaded = createSelector(
  getAlarmsState,
  (state: AlarmsState) => state.loaded
);
const getError = createSelector(
  getAlarmsState,
  (state: AlarmsState) => state.error
);

const getAllAlarms = createSelector(
  getAlarmsState,
  getLoaded,
  (state: AlarmsState, isLoaded) => {
    return isLoaded ? state.list : [];
  }
);
const getSelectedId = createSelector(
  getAlarmsState,
  (state: AlarmsState) => state.selectedId
);
const getSelectedAlarms = createSelector(
  getAllAlarms,
  getSelectedId,
  (alarms, id) => {
    const result = alarms.find(it => it['id'] === id);
    return result ? Object.assign({}, result) : undefined;
  }
);

export const alarmsQuery = {
  getLoaded,
  getError,
  getAllAlarms,
  getSelectedAlarms
};
