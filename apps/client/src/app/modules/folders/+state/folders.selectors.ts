import { createFeatureSelector, createSelector } from '@ngrx/store';
import { FOLDERS_FEATURE_KEY, FoldersState } from './folders.reducer';
import { FolderContentType } from '../../../model/folder/folder-content-type';
import * as memoizee from 'memoizee';

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
const getSelectedId = memoizee((type: FolderContentType) => createSelector(
  getFoldersState,
  (state: FoldersState) => state.selectedIds[type]
));
const getSelectedFolders = memoizee((type: FolderContentType) => createSelector(
  getAllFolders,
  getSelectedId(type),
  (folders, id) => {
    return folders.find(it => it.$key === id);
  }
));

export const foldersQuery = {
  getAllFolders,
  getSelectedFolders
};
