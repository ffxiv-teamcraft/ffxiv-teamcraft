import { createFeatureSelector, createSelector } from '@ngrx/store';
import { RotationsState } from './rotations.reducer';

// Lookup the 'Rotations' feature state managed by NgRx
const getRotationsState = createFeatureSelector<RotationsState>('rotations');

const getLoading = createSelector(
  getRotationsState,
  (state: RotationsState) => !state.loaded
);

const getAllRotations = createSelector(
  getRotationsState,
  getLoading,
  (state: RotationsState, isLoading) => {
    return state.rotations;
  }
);
const getSelectedId = createSelector(
  getRotationsState,
  (state: RotationsState) => state.selectedId
);
const getSelectedRotation = createSelector(
  getAllRotations,
  getSelectedId,
  (rotations, id) => {
    return rotations.find(it => it.$key === id);
  }
);

export const rotationsQuery = {
  getLoading,
  getAllRotations,
  getSelectedRotation
};
