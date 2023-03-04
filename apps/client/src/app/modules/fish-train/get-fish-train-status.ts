import { PersistedFishTrain } from '../../model/other/persisted-fish-train';
import { FishTrainStatus } from '../../pages/fish-trains/fish-trains/fish-train-status';

export function getFishTrainStatus(train: PersistedFishTrain): FishTrainStatus {
  if (train.start > Date.now()) {
    return FishTrainStatus.WAITING;
  }
  if (train.end < Date.now()) {
    return FishTrainStatus.STOPPED;
  }
  return FishTrainStatus.RUNNING;
}
