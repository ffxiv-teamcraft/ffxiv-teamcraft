import { DataModel } from '../../core/database/storage/data-model';
import { FishTrain, FishTrainStop } from '@ffxiv-teamcraft/types';
import { ForeignKey } from '../../core/database/relational/foreign-key';
import { TeamcraftUser } from '../user/teamcraft-user';

export class PersistedFishTrain extends DataModel implements FishTrain {

  @ForeignKey(TeamcraftUser)
  conductor?: string;

  fish: FishTrainStop[];

  passengers: string[];

  start: number;

  end: number;

  name: string;

  conductorToken: string;

  world?: string;

  public?: boolean;
}
