import { Action, createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';

import * as CommissionsActions from './commissions.actions';
import { Commission } from '../model/commission';

export const COMMISSIONS_FEATURE_KEY = 'commissions';

export interface State extends EntityState<Commission> {
  selectedId?: string; // which Commissions record has been selected
  loaded: boolean; // has the Commissions list been loaded
}

export interface CommissionsPartialState {
  readonly [COMMISSIONS_FEATURE_KEY]: State;
}

export const commissionsAdapter: EntityAdapter<Commission> = createEntityAdapter<Commission>({
  selectId: model => model.$key
});

export const initialState: State = commissionsAdapter.getInitialState({
  // set initial required properties
  loaded: false
});

const commissionsReducer = createReducer(
  initialState,
  on(CommissionsActions.commissionsLoaded, (state, { commissions }) =>
    commissionsAdapter.setAll(commissions, { ...state, loaded: true })
  )
);

export function reducer(state: State | undefined, action: Action) {
  return commissionsReducer(state, action);
}
