import { DataModel } from '../../core/database/storage/data-model';
import { FishTrain, FishTrainStop } from '@ffxiv-teamcraft/types';

export class PersistedFishTrain extends DataModel implements FishTrain {
  fish: FishTrainStop[];

  passengers: string[];

  start: number;

  end: number;

  name: string;

  conductorToken: string;
}
