import { FoldersAction, FoldersActionTypes } from './folders.actions';
import { Folder } from '../../../model/folder/folder';

export const FOLDERS_FEATURE_KEY = 'folders';

export interface FoldersState {
  list: Folder<any>[];
  selectedIds?: { [index: number]: string };
}

export interface FoldersPartialState {
  readonly [FOLDERS_FEATURE_KEY]: FoldersState;
}

export const initialState: FoldersState = {
  list: [],
  selectedIds: {}
};

export function reducer(
  state: FoldersState = initialState,
  action: FoldersAction
): FoldersState {
  switch (action.type) {
    case FoldersActionTypes.FoldersLoaded: {
      return {
        ...state,
        list: [
          ...state.list.filter(folder => !action.payload.some(s => s.$key === folder.$key)),
          ...action.payload
        ]
      };
    }
    case FoldersActionTypes.FolderLoaded: {
      return {
        ...state,
        list: [
          ...state.list.filter(folder => action.payload.$key !== folder.$key),
          action.payload
        ]
      };
    }
    case FoldersActionTypes.DeleteFolder: {
      return {
        ...state,
        list: [
          ...state.list.filter(folder => action.key !== folder.$key)
        ]
      };
    }
    case FoldersActionTypes.SelectFolder: {
      return {
        ...state,
        selectedIds: {
          ...state.selectedIds,
          [action.contentType]: action.key
        }
      };
    }
  }
  return state;
}
