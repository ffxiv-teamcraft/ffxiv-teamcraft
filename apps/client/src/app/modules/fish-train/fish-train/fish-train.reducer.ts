import { createReducer, on } from '@ngrx/store';
import * as FishTrainActions from './fish-train.actions';
import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { PersistedFishTrain } from '../../../model/other/persisted-fish-train';

export const fishTrainFeatureKey = 'fishTrain';

export interface State extends EntityState<PersistedFishTrain> {
  loaded: boolean;

  selectedId?: string;
}

export const fishTrainAdapter = createEntityAdapter<PersistedFishTrain>({
  selectId: train => train.$key
});

export const initialState: State = fishTrainAdapter.getInitialState({ loaded: false });
export const reducer = createReducer(
  initialState,
  on(FishTrainActions.loadFishTrainSuccess, (state, { train }) => fishTrainAdapter.setOne(train, {
    ...state
  })),
  on(FishTrainActions.loadFishTrainNotFound, (state, { id }) => fishTrainAdapter.setOne({ $key: id, notFound: true } as PersistedFishTrain, {
    ...state
  })),
  on(FishTrainActions.selectFishTrain, (state, { id }) => ({
    ...state,
    selectedId: id
  })),
  on(FishTrainActions.loadFishTrainsSuccess, (state, { trains, loaded }) => fishTrainAdapter.setMany(trains, {
    ...state,
    loaded: state.loaded || loaded
  }))
);
