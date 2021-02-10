import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromFreecompanyWorkshop from './freecompany-workshop.reducer';
import { FreecompanyWorkshop } from '../model/freecompany-workshop';

export const getFreecompanyWorkshopState = createFeatureSelector<fromFreecompanyWorkshop.State>(
  fromFreecompanyWorkshop.freecompanyWorkshopsFeatureKey
)

export const selectAll = fromFreecompanyWorkshop.selectAll;

export const selectWorkshops = createSelector(
  getFreecompanyWorkshopState,
  fromFreecompanyWorkshop.selectAll,
);
export const selectWorkshop = createSelector(
  getFreecompanyWorkshopState,
  // (workshops, props: { id: number }): FreecompanyWorkshop => workshops[props.id],
  (state): FreecompanyWorkshop => state.entities[state.currentFreecompanyId],
);
