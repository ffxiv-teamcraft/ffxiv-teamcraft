import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromFishTrain from './fish-train.reducer';
import { fishTrainAdapter } from './fish-train.reducer';

export const getFishTrainState = createFeatureSelector<fromFishTrain.State>(
  fromFishTrain.fishTrainFeatureKey
);

const { selectEntities } = fishTrainAdapter.getSelectors();

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


