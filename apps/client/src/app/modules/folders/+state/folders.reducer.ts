import { FoldersAction, FoldersActionTypes } from './folders.actions';
import { Folder } from '../../../model/folder/folder';

export const FOLDERS_FEATURE_KEY = 'folders';

export interface FoldersState {
  list: Folder<any>[];
  selectedIds?: { [index: number]: string }
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
          ...state.list,
          ...action.payload.filter(folder => !state.list.some(s => s.$key === folder.$key))
        ]
      };
    }
  }
  return state;
}
