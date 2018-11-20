import { DataModel } from '../../core/database/storage/data-model';
import { Favorites } from '../other/favorites';
import { LodestoneIdEntry } from './lodestone-id-entry';

export class TeamcraftUser extends DataModel {
  defaultLodestoneId: number;
  // FC of the character currently selected
  currentFcId: string;
  lodestoneIds: LodestoneIdEntry[] = [];

  favorites: Favorites = { lists: [], workshops: [] };

  contacts: string[] = [];

  admin = false;

  patron = false;
}
