import { createFeatureSelector, createSelector } from '@ngrx/store';
import {
  ROTATIONFOLDERS_FEATURE_KEY,
  RotationFoldersState
} from './rotation-folders.reducer';

// Lookup the 'RotationFolders' feature state managed by NgRx
const getRotationFoldersState = createFeatureSelector<RotationFoldersState>(
  ROTATIONFOLDERS_FEATURE_KEY
);

const getLoaded = createSelector(
  getRotationFoldersState,
  (state: RotationFoldersState) => state.loaded
);

const getAllRotationFolders = createSelector(
  getRotationFoldersState,
  (state: RotationFoldersState) => {
    return state.list;
  }
);
const getSelectedId = createSelector(
  getRotationFoldersState,
  (state: RotationFoldersState) => state.selectedId
);
const getSelectedRotationFolder = createSelector(
  getAllRotationFolders,
  getSelectedId,
  (rotationFolders, id) => {
    return rotationFolders.find(it => it.$key === id);
  }
);

export const rotationFoldersQuery = {
  getLoaded,
  getAllRotationFolders,
  getSelectedRotationFolder
};
