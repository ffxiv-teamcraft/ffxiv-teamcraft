import { ListsAction, ListsActionTypes } from './lists.actions';
import { List } from '../model/list';


export interface ListsState {
  lists: List[]; // list of Lists; analogous to a sql normalized table
  selectedId?: string; // which Lists record has been selected
  loaded: boolean; // has the Lists list been loaded
}

export const initialState: ListsState = {
  lists: [],
  loaded: false
};

export function listsReducer(
  state: ListsState = initialState,
  action: ListsAction
): ListsState {
  switch (action.type) {
    case ListsActionTypes.ListsLoaded: {
      state = {
        ...state,
        lists: action.payload,
        loaded: true
      };
      break;
    }
  }
  return state;
}
