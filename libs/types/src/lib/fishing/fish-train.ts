import { FishTrainStop } from './fish-train-stop';

export interface FishTrain {
  $key?: string;
  start: number;
  end: number;
  fish: FishTrainStop[];
  passengers: string[];
  name: string;
  conductorToken: string;
}
