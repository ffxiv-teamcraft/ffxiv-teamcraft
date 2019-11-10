import { DirtyAction, DirtyActionTypes } from './dirty.actions';
import { DirtyEntry } from '../dirty-entry';

export const DIRTY_FEATURE_KEY = 'dirty';

export interface DirtyState {
  entries: DirtyEntry[];
}

export interface DirtyPartialState {
  readonly [DIRTY_FEATURE_KEY]: DirtyState;
}

export const dirtyInitialState: DirtyState = {
  entries: []
};

export function dirtyReducer(
  state: DirtyState = dirtyInitialState,
  action: DirtyAction
): DirtyState {
  switch (action.type) {
    case DirtyActionTypes.AddDirty: {
      state = {
        ...state,
        entries: [
          ...state.entries.filter(entry => entry.id !== action.payload.id || entry.scope !== action.payload.scope),
          action.payload
        ]
      };
      break;
    }
    case DirtyActionTypes.RemoveDirty: {
      state = {
        ...state,
        entries: [...state.entries.filter(entry => entry.id !== action.payload.id || entry.scope !== action.payload.scope)]
      };
      break;
    }
  }
  return state;
}
