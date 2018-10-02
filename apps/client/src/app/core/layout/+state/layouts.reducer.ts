import { LayoutsAction, LayoutsActionTypes } from './layouts.actions';
import { ListLayout } from '../list-layout';

/**
 * Interface for the 'Layouts' data used in
 *  - LayoutsState, and
 *  - layoutsReducer
 *
 *  Note: replace if already defined in another module
 */

export interface LayoutsState {
  layouts: ListLayout[]; // list of Layouts; analogous to a sql normalized table
  selectedKey?: string; // which Layouts record has been selected
  loaded: boolean; // has the Layouts list been loaded
}

export const initialState: LayoutsState = {
  layouts: [],
  loaded: false
};

export function layoutsReducer(
  state: LayoutsState = initialState,
  action: LayoutsAction
): LayoutsState {
  switch (action.type) {
    case LayoutsActionTypes.LayoutsLoaded: {
      state = {
        ...state,
        layouts: action.payload,
        loaded: true
      };
      break;
    }

    case LayoutsActionTypes.SelectLayout: {
      state = {
        ...state,
        selectedKey: action.key
      };
      break;
    }
  }
  return state;
}
