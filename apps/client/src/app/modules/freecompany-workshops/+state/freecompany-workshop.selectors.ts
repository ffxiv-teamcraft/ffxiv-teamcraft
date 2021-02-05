import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromFreecompanyWorkshop from './freecompany-workshop.reducer';

export const getFreecompanyWorkshopState = createFeatureSelector<fromFreecompanyWorkshop.State>(
  fromFreecompanyWorkshop.freecompanyWorkshopsFeatureKey
)

export const selectAll = fromFreecompanyWorkshop.selectAll;

export const selectWorkshops = createSelector(
  getFreecompanyWorkshopState,
  fromFreecompanyWorkshop.selectAll,
);
export const selectAllWorkshopsEntities = createSelector(
  getFreecompanyWorkshopState,
  fromFreecompanyWorkshop.selectEntities,
);
