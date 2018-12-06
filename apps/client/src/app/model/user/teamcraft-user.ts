import { DataModel } from '../../core/database/storage/data-model';
import { Favorites } from '../other/favorites';
import { LodestoneIdEntry } from './lodestone-id-entry';
import { Character } from '@xivapi/angular-client';
import { DefaultConsumables } from './default-consumables';

export class TeamcraftUser extends DataModel {
  defaultLodestoneId: number;
  // FC of the character currently selected
  currentFcId: string;
  lodestoneIds: LodestoneIdEntry[] = [];

  customCharacters: Partial<Character>[] = [];

  favorites: Favorites = { lists: [], workshops: [], rotations: [], rotationFolders: [] };

  contacts: string[] = [];

  admin = false;

  patron = false;

  defaultConsumables: DefaultConsumables;
}
