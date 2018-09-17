import { ListsAction, ListsActionTypes } from './lists.actions';
import { List } from '../model/list';


export interface ListsState {
  list: List[]; // list of Lists; analogous to a sql normalized table
  selectedId?: string | number; // which Lists record has been selected
  loaded: boolean; // has the Lists list been loaded
  error?: any; // last none error (if any)
}

export const initialState: ListsState = {
  list: [],
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
        list: action.payload,
        loaded: true
      };
      break;
    }
  }
  return state;
}
