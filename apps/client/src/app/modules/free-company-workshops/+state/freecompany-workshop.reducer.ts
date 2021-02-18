import { Action, createReducer, on } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { FreeCompanyWorkshop } from '../model/free-company-workshop';
import * as FreeCompanyWorkshopActions from './free-company-workshop.actions';

export const freeCompanyWorkshopsFeatureKey = 'freeCompanyWorkshops';

export interface State extends EntityState<FreeCompanyWorkshop> {
  // additional entities state properties
  currentFreeCompanyId: string;
}

export const adapter: EntityAdapter<FreeCompanyWorkshop> = createEntityAdapter<FreeCompanyWorkshop>();

export const initialState: State = adapter.getInitialState({
  // additional entity state properties
  currentFreeCompanyId: null
});


export const freeCompanyWorkshopReducer = createReducer(
  initialState,
  on(FreeCompanyWorkshopActions.setFreeCompanyId,
    (state, action) => ({
      ...state,
      currentFreeCompanyId: action.id
    })
  ),
  on(FreeCompanyWorkshopActions.addFreeCompanyWorkshop,
    (state, action) => adapter.addOne(action.freeCompanyWorkshop, state)
  ),
  on(FreeCompanyWorkshopActions.upsertFreeCompanyWorkshop,
    (state, action) => adapter.upsertOne(action.freeCompanyWorkshop, state)
  ),
  on(FreeCompanyWorkshopActions.addFreeCompanyWorkshops,
    (state, action) => adapter.addMany(action.freeCompanyWorkshops, state)
  ),
  on(FreeCompanyWorkshopActions.upsertFreeCompanyWorkshops,
    (state, action) => adapter.upsertMany(action.freeCompanyWorkshops, state)
  ),
  on(FreeCompanyWorkshopActions.updateFreeCompanyWorkshop,
    (state, action) => adapter.updateOne(action.freeCompanyWorkshop, state)
  ),
  on(FreeCompanyWorkshopActions.updateFreeCompanyWorkshops,
    (state, action) => adapter.updateMany(action.freeCompanyWorkshops, state)
  ),
  on(FreeCompanyWorkshopActions.deleteFreeCompanyWorkshop,
    (state, action) => adapter.removeOne(action.id, state)
  ),
  on(FreeCompanyWorkshopActions.deleteFreeCompanyWorkshops,
    (state, action) => adapter.removeMany(action.ids, state)
  ),
  on(FreeCompanyWorkshopActions.loadFreeCompanyWorkshops,
    (state, action) => adapter.setAll(action.freeCompanyWorkshops, state)
  ),
  on(FreeCompanyWorkshopActions.clearFreeCompanyWorkshops,
    state => adapter.removeAll(state)
  )
);


export const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal
} = adapter.getSelectors();

export function reducer(state: State | undefined, action: Action) {
  return freeCompanyWorkshopReducer(state, action);
}
