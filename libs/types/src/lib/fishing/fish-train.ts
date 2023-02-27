import { FishTrainStop } from './fish-train-stop';

export interface FishTrain {
  $key?: string;
  start: number;

  fish: FishTrainStop[];
}
