import { Action, createReducer, on } from '@ngrx/store';

import * as CommissionsActions from './commissions.actions';
import { Commission } from '../model/commission';

export const COMMISSIONS_FEATURE_KEY = 'commissions';

export interface State {
  selectedId?: string;
  commissions: Commission[];
  loaded: boolean;
}

export interface CommissionsPartialState {
  readonly [COMMISSIONS_FEATURE_KEY]: State;
}

export const initialState: State = {
  commissions: [],
  loaded: false
};

const commissionsReducer = createReducer(
  initialState,
  on(CommissionsActions.commissionsLoaded, (state, { commissions, userId }) => {
    return {
      ...state,
      commissions: [...state.commissions.filter(c => c.authorId !== userId && c.crafterId !== userId), ...commissions],
      loaded: true
    };
  }),
  on(CommissionsActions.commissionLoaded, (state, { commission }) => {
    return {
      ...state,
      commissions: [...state.commissions.filter(c => c.$key !== commission.$key), commission]
    };
  }),
  on(CommissionsActions.selectCommission, (state, { key }) => {
    return {
      ...state,
      selectedId: key
    };
  }),
  on(CommissionsActions.updateCommission, (state, { commission }) => {
    return {
      ...state,
      commissions: state.commissions.map(c => c.$key === commission.$key ? commission : c)
    };
  }),
  on(CommissionsActions.deleteCommission, (state, { key }) => {
    return {
      ...state,
      commissions: state.commissions.filter(c => c.$key !== key)
    };
  })
);

export function reducer(state: State | undefined, action: Action) {
  return commissionsReducer(state, action);
}
