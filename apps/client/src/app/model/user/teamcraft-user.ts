import { DataModel } from '../../core/database/storage/data-model';

export class TeamcraftUser extends DataModel {
  defaultLodestoneId: number;
  lodestoneIds: number[];
}
