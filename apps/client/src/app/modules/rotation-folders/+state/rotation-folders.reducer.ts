import { RotationFoldersAction, RotationFoldersActionTypes } from './rotation-folders.actions';
import { CraftingRotationsFolder } from '../../../model/other/crafting-rotations-folder';

export const ROTATIONFOLDERS_FEATURE_KEY = 'rotationFolders';

export interface RotationFoldersState {
  list: CraftingRotationsFolder[]; // list of RotationFolders; analogous to a sql normalized table
  selectedId?: string | number; // which RotationFolders record has been selected
  loaded: boolean; // has the RotationFolders list been loaded
}

export interface RotationFoldersPartialState {
  readonly [ROTATIONFOLDERS_FEATURE_KEY]: RotationFoldersState;
}

export const initialState: RotationFoldersState = {
  list: [],
  loaded: false
};

export function rotationFoldersReducer(
  state: RotationFoldersState = initialState,
  action: RotationFoldersAction
): RotationFoldersState {
  switch (action.type) {
    case RotationFoldersActionTypes.MyRotationFoldersLoaded: {
      state = {
        ...state,
        list: [
          ...state.list.filter(folder => folder.authorId !== action.userId),
          ...action.payload
        ],
        loaded: true
      };
      break;
    }

    case RotationFoldersActionTypes.UpdateRotationFolder: {
      state = {
        ...state,
        list: [
          ...state.list.map(folder => {
            if (folder.$key === action.folder.$key) {
              return action.folder;
            }
            return folder;
          })
        ]
      };
      break;
    }

    case RotationFoldersActionTypes.CreateRotationFolder: {
      state = {
        ...state,
        list: [
          ...state.list,
          action.folder
        ]
      };
      break;
    }

    case RotationFoldersActionTypes.SelectRotationFolder: {
      state = {
        ...state,
        selectedId: action.key
      };
      break;
    }

    case RotationFoldersActionTypes.RotationFolderLoaded: {
      state = {
        ...state,
        list: [
          ...state.list.filter(folder => folder.$key !== action.folder.$key),
          action.folder
        ]
      };
      break;
    }

    case RotationFoldersActionTypes.DeleteRotationFolder: {
      state = {
        ...state,
        list: [
          ...state.list.filter(folder => folder.$key !== action.key)
        ]
      };
      break;
    }
  }
  return state;
}
