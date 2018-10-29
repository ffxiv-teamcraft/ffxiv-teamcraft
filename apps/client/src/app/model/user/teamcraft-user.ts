import { DataModel } from '../../core/database/storage/data-model';

export class TeamcraftUser extends DataModel {
  defaultLodestoneId: number;
  // FC of the character currently selected
  currentFcId: string;
  lodestoneIds: {id: number, verified: boolean}[] = [];
}
