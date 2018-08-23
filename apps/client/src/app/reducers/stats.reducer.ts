import { StatsActions, StatsActionTypes } from '../actions/stats.actions';

export interface State {
  listsCreatedCount: number;
  listsStoredCount: number;
}

export const initialState: State = {
  listsCreatedCount: 0,
  listsStoredCount: 0
};

export function reducer(state = initialState, action: StatsActions): State {
  switch (action.type) {

    case StatsActionTypes.ListsStoredCountUpdated:
      return { ...state, listsStoredCount: action.count };

    case StatsActionTypes.ListsCountUpdated:
      return { ...state, listsCreatedCount: action.count };

    default:
      return state;
  }
}
