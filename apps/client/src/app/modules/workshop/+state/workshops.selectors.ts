import { createFeatureSelector, createSelector } from '@ngrx/store';
import { WorkshopsState } from './workshops.reducer';

// Lookup the 'Workshops' feature state managed by NgRx
const getWorkshopsState = createFeatureSelector<WorkshopsState>('workshops');

const getLoaded = createSelector(
  getWorkshopsState,
  (state: WorkshopsState) => state.workshopsConnected
);

const getAllWorkshops = createSelector(
  getWorkshopsState,
  getLoaded,
  (state: WorkshopsState, isLoaded) => {
    return isLoaded ? state.workshops : [];
  }
);
const getSelectedId = createSelector(
  getWorkshopsState,
  (state: WorkshopsState) => state.selectedId
);
const getSelectedWorkshop = createSelector(
  getAllWorkshops,
  getSelectedId,
  (workshops, id) => {
    return workshops.find(it => it.$key === id);
  }
);

export const workshopsQuery = {
  getLoaded,
  getAllWorkshops,
  getSelectedWorkshop
};
