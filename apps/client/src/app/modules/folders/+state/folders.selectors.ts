import { createFeatureSelector, createSelector } from '@ngrx/store';
import { FOLDERS_FEATURE_KEY, FoldersState } from './folders.reducer';

// Lookup the 'Folders' feature state managed by NgRx
const getFoldersState = createFeatureSelector<FoldersState>(
  FOLDERS_FEATURE_KEY
);

const getAllFolders = createSelector(
  getFoldersState,
  (state: FoldersState) => {
    return state.list;
  }
);

const getSelectedIds = createSelector(
  getFoldersState,
  (state: FoldersState) => state.selectedIds
);

const getSelectedFolders = createSelector(
  getAllFolders,
  getSelectedIds,
  (folders, ids) => {
    return Object.entries(ids).reduce((acc, [id, key]) => {
      acc[id] = folders.find(f => f.$key === key);
      return acc;
    }, {});
  }
);

export const foldersQuery = {
  getAllFolders,
  getSelectedFolders
};
