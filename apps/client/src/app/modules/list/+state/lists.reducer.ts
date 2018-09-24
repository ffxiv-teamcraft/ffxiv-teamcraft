import { ListsAction, ListsActionTypes, ListsType } from './lists.actions';
import { List } from '../model/list';


export interface ListsState {
  lists: List[]; // list of Lists; analogous to a sql normalized table
  selectedId?: string; // which Lists record has been selected
  myListsConnected: boolean;
  communityListsConnected: boolean;
}

export const initialState: ListsState = {
  lists: [],
  myListsConnected: false,
  communityListsConnected: false
};

export function listsReducer(
  state: ListsState = initialState,
  action: ListsAction
): ListsState {
  switch (action.type) {
    case ListsActionTypes.LoadMyLists: {
      state = {
        ...state,
        lists: [],
        myListsConnected: false
      };
      break;
    }

    case ListsActionTypes.ListsLoaded: {
      state = {
        ...state,
        lists: [
          ...state.lists,
          ...action.payload.filter(list => state.lists.find(l => l.$key === list.$key) === undefined)
        ],
        myListsConnected: state.myListsConnected || action.listsType === ListsType.MY_LISTS,
        communityListsConnected: state.communityListsConnected || action.listsType === ListsType.COMMUNITY_LISTS
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
