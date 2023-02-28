import { createAction, props } from '@ngrx/store';
import { PersistedFishTrain } from '../../../model/other/persisted-fish-train';

export const loadFishTrain = createAction(
  '[FishTrain] Load FishTrain',
  props<{ id: string }>()
);
export const loadFishTrainSuccess = createAction(
  '[FishTrain] Load FishTrain Success',
  props<{ train: PersistedFishTrain }>()
);
export const loadFishTrainNotFound = createAction(
  '[FishTrain] Load FishTrain Not Found',
  props<{ id: string }>()
);

export const selectFishTrain = createAction(
  '[FishTrain] Select FishTrain',
  props<{ id: string }>()
);



