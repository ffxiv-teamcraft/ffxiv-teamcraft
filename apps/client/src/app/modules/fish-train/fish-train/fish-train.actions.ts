import { createAction, props } from '@ngrx/store';
import { PersistedFishTrain } from '../../../model/other/persisted-fish-train';
import { FishTrainStop } from '@ffxiv-teamcraft/types';
import { UpdateData } from '@angular/fire/firestore';

export const loadFishTrain = createAction(
  '[FishTrain] Load FishTrain',
  props<{ id: string }>()
);
export const loadRunningTrains = createAction(
  '[FishTrain] Load Running FishTrain'
);
export const loadAllTrains = createAction(
  '[FishTrain] Load All FishTrains'
);
export const loadFishTrainsSuccess = createAction(
  '[FishTrain] Load FishTrains Success',
  props<{ trains: PersistedFishTrain[], loaded?: boolean }>()
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

export const boardTrain = createAction(
  '[FishTrain] Board FishTrain',
  props<{ id: string }>()
);

export const claimConductorRole = createAction(
  '[FishTrain] Claim FishTrain Conductor Role',
  props<{ id: string }>()
);

export const setFishSlap = createAction(
  '[FishTrain] Set FishTrain Fish Slap',
  props<{ train: PersistedFishTrain, fish: FishTrainStop, slap: number }>()
);

export const pureUpdateTrain = createAction(
  '[FishTrain] Pure Update FishTrain',
  props<{ id: string, train: UpdateData<PersistedFishTrain> }>()
);

export const leaveTrain = createAction(
  '[FishTrain] Leave FishTrain',
  props<{ id: string }>()
);



