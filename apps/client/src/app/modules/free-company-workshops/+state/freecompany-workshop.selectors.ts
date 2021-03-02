import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromFreeCompanyWorkshop from './freecompany-workshop.reducer';
import { FreeCompanyWorkshop } from '../model/free-company-workshop';

export const getFreeCompanyWorkshopState = createFeatureSelector<fromFreeCompanyWorkshop.State>(
  fromFreeCompanyWorkshop.freeCompanyWorkshopsFeatureKey
);

export const selectAll = fromFreeCompanyWorkshop.selectAll;

export const selectWorkshops = createSelector(
  getFreeCompanyWorkshopState,
  fromFreeCompanyWorkshop.selectAll
);

export const selectCurrentWorkshop = createSelector(
  getFreeCompanyWorkshopState,
  (state): FreeCompanyWorkshop => state.entities[state.currentFreeCompanyId]
);

export const selectCurrentFreeCompanyId = createSelector(
  getFreeCompanyWorkshopState,
  (state): string => state.currentFreeCompanyId
);
