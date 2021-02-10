import { Action, createReducer, on } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { FreecompanyWorkshop } from '../model/freecompany-workshop';
import * as FreecompanyWorkshopActions from './freecompany-workshop.actions';
import { VesselType } from '../model/vessel-type';

export const freecompanyWorkshopsFeatureKey = 'freecompanyWorkshops';

export interface State extends EntityState<FreecompanyWorkshop> {
  // additional entities state properties
  currentFreecompanyId?: string;
}

export const adapter: EntityAdapter<FreecompanyWorkshop> = createEntityAdapter<FreecompanyWorkshop>();

export const initialState: State = adapter.getInitialState({
  // additional entity state properties
});


export const freecompanyWorkshopReducer = createReducer(
  initialState,
  on(FreecompanyWorkshopActions.setFreecompanyId,
    (state, action) =>({
      ...state,
      currentFreecompanyId: action.id
    })
  ),
  on(FreecompanyWorkshopActions.addFreecompanyWorkshop,
    (state, action) => adapter.addOne(action.freecompanyWorkshop, state)
  ),
  on(FreecompanyWorkshopActions.upsertFreecompanyWorkshop,
    (state, action) => adapter.upsertOne(action.freecompanyWorkshop, state)
  ),
  on(FreecompanyWorkshopActions.addFreecompanyWorkshops,
    (state, action) => adapter.addMany(action.freecompanyWorkshops, state)
  ),
  on(FreecompanyWorkshopActions.upsertFreecompanyWorkshops,
    (state, action) => adapter.upsertMany(action.freecompanyWorkshops, state)
  ),
  on(FreecompanyWorkshopActions.updateFreecompanyWorkshop,
    (state, action) => adapter.updateOne(action.freecompanyWorkshop, state)
  ),
  on(FreecompanyWorkshopActions.updateFreecompanyWorkshops,
    (state, action) => adapter.updateMany(action.freecompanyWorkshops, state)
  ),
  on(FreecompanyWorkshopActions.deleteFreecompanyWorkshop,
    (state, action) => adapter.removeOne(action.id, state)
  ),
  on(FreecompanyWorkshopActions.deleteFreecompanyWorkshops,
    (state, action) => adapter.removeMany(action.ids, state)
  ),
  on(FreecompanyWorkshopActions.loadFreecompanyWorkshops,
    (state, action) => adapter.setAll(action.freecompanyWorkshops, state)
  ),
  on(FreecompanyWorkshopActions.clearFreecompanyWorkshops,
    state => adapter.removeAll(state)
  ),
);


export const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
} = adapter.getSelectors();

export function reducer(state: State | undefined, action: Action) {
  return freecompanyWorkshopReducer(state, action);
}
