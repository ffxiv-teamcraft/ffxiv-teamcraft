import { CustomItemsAction, CustomItemsActionTypes } from './custom-items.actions';
import { CustomItem } from '../model/custom-item';
import { CustomItemFolder } from '../model/custom-item-folder';

export const CUSTOMITEMS_FEATURE_KEY = 'custom-items';

export interface CustomItemsState {
  list: CustomItem[]; // list of CustomItems; analogous to a sql normalized table
  folders: CustomItemFolder[]; // list of CustomItemFolders; analogous to a sql normalized table
  loaded: boolean; // has the CustomItems list been loaded
  foldersLoaded: boolean; // has the CustomItems list been loaded
}

export interface CustomItemsPartialState {
  readonly [CUSTOMITEMS_FEATURE_KEY]: CustomItemsState;
}

export const customItemsInitialState: CustomItemsState = {
  list: [],
  folders: [],
  loaded: false,
  foldersLoaded: false
};

export function customItemsReducer(
  state: CustomItemsState = customItemsInitialState,
  action: CustomItemsAction
): CustomItemsState {
  switch (action.type) {
    case CustomItemsActionTypes.CustomItemsLoaded: {
      state = {
        ...state,
        list: action.payload,
        loaded: true
      };
      break;
    }

    case CustomItemsActionTypes.UpdateCustomItem: {
      state = {
        ...state,
        list: [
          ...state.list.map(item => {
            if (item.authorId === action.payload.$key) {
              return action.payload;
            }
            return item;
          })
        ],
        loaded: true
      };
      break;
    }

    case CustomItemsActionTypes.CreateCustomItem: {
      state = {
        ...state,
        list: [
          ...state.list,
          action.payload
        ]
      };
      break;
    }

    case CustomItemsActionTypes.DeleteCustomItem: {
      state = {
        ...state,
        list: [
          ...state.list.filter(item => item.$key !== action.key)
        ]
      };
      break;
    }

    case CustomItemsActionTypes.CustomItemFoldersLoaded: {
      state = {
        ...state,
        folders: action.payload,
        foldersLoaded: true
      };
      break;
    }

    case CustomItemsActionTypes.UpdateCustomItemFolder: {
      state = {
        ...state,
        folders: [
          ...state.folders.map(folder => {
            if (folder.authorId === action.payload.$key) {
              return action.payload;
            }
            return folder;
          })
        ],
        loaded: true
      };
      break;
    }

    case CustomItemsActionTypes.CreateCustomItemFolder: {
      state = {
        ...state,
        folders: [
          ...state.folders,
          action.payload
        ]
      };
      break;
    }

    case CustomItemsActionTypes.DeleteCustomItemFolder: {
      state = {
        ...state,
        folders: [
          ...state.folders.filter(folder => folder.$key !== action.key)
        ]
      };
      break;
    }
  }
  return state;
}
