import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromFishTrain from './fish-train.reducer';
import { fishTrainAdapter } from './fish-train.reducer';

export const getFishTrainState = createFeatureSelector<fromFishTrain.State>(
  fromFishTrain.fishTrainFeatureKey
);

const { selectEntities, selectAll } = fishTrainAdapter.getSelectors();

export const getLoaded = createSelector(
  getFishTrainState,
  state => state.loaded
);

export const getSelectedId = createSelector(
  getFishTrainState,
  state => state.selectedId
);

export const getFishTrainEntities = createSelector(
  getFishTrainState,
  state => selectEntities(state)
);

export const getSelectedTrain = createSelector(
  getFishTrainEntities,
  getSelectedId,
  (entities, id) => id && entities[id]
);

export const getAllFishTrains = createSelector(
  getFishTrainState,
  state => selectAll(state)
);

export const getBoardedTrain = (userId: string) => createSelector(
  getAllFishTrains,
  (trains) => trains.find(train => train.passengers.includes(userId))
);

export const getAllPublicFishingTrains = createSelector(
  getAllFishTrains,
  (trains) => trains.filter(train => train.public)
);


