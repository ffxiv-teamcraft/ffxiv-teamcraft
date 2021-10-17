import { Action, createReducer, on } from '@ngrx/store';

import * as LazyDataActions from './lazy-data.actions';
import { DataEntryStatus } from '../data-entry-status';
import { LazyDataKey, LazyDataWithExtracts } from '../lazy-data-types';

export const LAZY_DATA_FEATURE_KEY = 'lazyData';

export interface State {
  data: Partial<LazyDataWithExtracts>;
  loadingStates: { [Property in LazyDataKey]?: DataEntryStatus };
  loadingEntries: string[];
}

export const initialState: State = {
  data: {},
  loadingStates: {},
  loadingEntries: []
};

export interface LazyDataPartialState {
  readonly [LAZY_DATA_FEATURE_KEY]: State;
}

const lazyDataReducer = createReducer(
  initialState,
  on(LazyDataActions.loadLazyDataEntityEntry, (state, { entity, id }) => ({
    ...state,
    loadingStates: {
      ...state.loadingStates,
      [entity]: {
        status: 'partial',
        record: {
          ...(state.loadingStates[entity]?.record || {}),
          [id]: 'loading'
        }
      }
    },
    loadingEntries: [
      ...state.loadingEntries,
      `${entity}:${id}`
    ]
  })),
  on(LazyDataActions.loadLazyDataEntityEntrySuccess, (state, { id, key, row }) => ({
    ...state,
    data: {
      ...state.data,
      [key]: {
        ...(state.data[key] || {}),
        [id]: row
      }
    },
    loadingStates: {
      ...state.loadingStates,
      [key]: {
        // Prevent overriding full with partial
        status: state.loadingStates[key]?.status === 'loading' ? 'partial' : state.loadingStates[key]?.status,
        record: {
          ...(state.loadingStates[key]?.record || {}),
          [id]: 'full'
        }
      }
    },
    loadingEntries: state.loadingEntries.filter(e => e !== `${key}:${id}`)
  })),
  on(LazyDataActions.loadLazyDataFullEntity, (state, { entity }) => ({
    ...state,
    loadingStates: {
      ...state.loadingStates,
      [entity]: {
        status: 'loading',
        record: {}
      }
    },
    loadingEntries: [
      ...state.loadingEntries,
      entity
    ]
  })),
  on(LazyDataActions.loadLazyDataFullEntitySuccess, (state, { key, entry }) => ({
    ...state,
    data: {
      ...state.data,
      [key]: entry
    },
    loadingStates: {
      ...state.loadingStates,
      [key]: {
        status: 'full',
        record: {}
      }
    },
    loadingEntries: state.loadingEntries.filter(e => e !== key)
  }))
);

export function reducer(state: State, action: Action) {
  return lazyDataReducer(state, action);
}
