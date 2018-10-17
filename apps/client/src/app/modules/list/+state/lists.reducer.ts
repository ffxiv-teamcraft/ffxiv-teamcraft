import { ListsAction, ListsActionTypes } from './lists.actions';
import { List } from '../model/list';


export interface ListsState {
  myLists: List[];
  listsWithWriteAccess: List[],
  listDetails: List[];
  selectedId?: string; // which Lists record has been selected
  myListsConnected: boolean;
  listsWithWriteAccessConnected: boolean;
  communityListsConnected: boolean;
}

export const initialState: ListsState = {
  myLists: [],
  listsWithWriteAccess: [],
  listDetails: [],
  myListsConnected: false,
  listsWithWriteAccessConnected: false,
  communityListsConnected: false
};

export function listsReducer(
  state: ListsState = initialState,
  action: ListsAction
): ListsState {
  switch (action.type) {
    case ListsActionTypes.MyListsLoaded: {
      state = {
        ...state,
        myLists: [
          ...action.payload
        ],
        myListsConnected: true
      };
      break;
    }

    case ListsActionTypes.ListsWithWriteAccessLoaded: {
      state = {
        ...state,
        listsWithWriteAccess: [
          ...action.payload.filter(list => state.myLists.find(l => l.$key === list.$key) === undefined)
        ],
        listsWithWriteAccessConnected: true
      };
      break;
    }

    case ListsActionTypes.UpdateList: {
      state = {
        ...state,
        listDetails: [
          ...state.listDetails.filter(list => list.$key !== action.payload.$key),
          action.payload
        ]
      };
      if (action.updateCompact && state.myLists.find(l => l.$key === action.payload.$key) !== undefined) {
        state.myLists = [
          ...state.myLists.filter(list => list.$key !== action.payload.$key),
          action.payload.getCompact()
        ];
      }
      break;
    }

    case ListsActionTypes.ListDetailsLoaded: {
      state = {
        ...state,
        listDetails: [
          ...state.listDetails.filter(list => list.$key !== action.payload.$key),
          <List>action.payload
        ]
      };
      break;
    }

    case ListsActionTypes.UpdateListIndex: {
      state = {
        ...state,
        myLists: [
          ...state.myLists.map(list => list.$key === action.payload.$key ? action.payload : list)
        ]
      };
      break;
    }

    case ListsActionTypes.DeleteList: {
      state = {
        ...state,
        myLists: [
          ...state.myLists.filter(list => list.$key !== action.key)
        ]
      };
      break;
    }

    case ListsActionTypes.SelectList: {
      state = {
        ...state,
        selectedId: action.key
      };
    }
  }
  return state;
}
