import { ListsAction, ListsActionTypes } from './lists.actions';
import { List } from '../model/list';


export interface ListsState {
  myLists: List[];
  listDetails: List[];
  selectedId?: string; // which Lists record has been selected
  myListsConnected: boolean;
  communityListsConnected: boolean;
}

export const initialState: ListsState = {
  myLists: [],
  listDetails: [],
  myListsConnected: false,
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

    case ListsActionTypes.ListDetailsLoaded: {
      state = {
        ...state,
        listDetails: [
          ...state.listDetails.filter(list => list.$key !== action.payload.$key),
          action.payload
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
