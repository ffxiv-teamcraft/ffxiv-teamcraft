import { createReducer, on } from '@ngrx/store';
import * as ListAggregatesActions from './list-aggregates.actions';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { ListAggregate } from '../model/list-aggregate';

export const listAggregatesFeatureKey = 'listAggregates';

export interface State extends EntityState<ListAggregate> {
  loaded: boolean;
  selectedId?: string;
}

export const listAggregateEntityAdapter: EntityAdapter<ListAggregate> = createEntityAdapter<ListAggregate>({
  selectId: (dashboard) => dashboard.$key
});

export const initialState: State = listAggregateEntityAdapter.getInitialState({
  // set initial required properties
  loaded: false
});

export const reducer = createReducer(
  initialState,
  on(ListAggregatesActions.loadListAggregates, state => ({
    ...state,
    loaded: false,
    error: null
  })),
  on(
    ListAggregatesActions.listAggregatesLoaded,
    (state, { aggregates }) =>
      listAggregateEntityAdapter.setAll(aggregates, {
        ...state,
        loaded: true
      })
  ),
  on(
    ListAggregatesActions.listAggregateLoaded,
    (state, { aggregate }) =>
      listAggregateEntityAdapter.setOne(aggregate, {
        ...state
      })
  ),
  on(
    ListAggregatesActions.selectListAggregate,
    (state, { id }) => {
      return {
        ...state,
        selectedId: id
      };
    }
  ),
  on(
    ListAggregatesActions.updateListAggregate,
    (state, { aggregate }) => {
      return listAggregateEntityAdapter.setOne(aggregate, {
        ...state,
        loaded: true
      });
    }
  )
);
