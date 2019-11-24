import { DataModel } from '../../core/database/storage/data-model';
import { Favorites } from '../other/favorites';
import { LodestoneIdEntry } from './lodestone-id-entry';
import { Character } from '@xivapi/angular-client';
import { DefaultConsumables } from './default-consumables';
import * as firebase from 'firebase/app';

export class TeamcraftUser extends DataModel {
  createdAt: firebase.firestore.Timestamp;
  defaultLodestoneId: number;
  // FC of the character currently selected
  currentFcId: string;
  lodestoneIds: LodestoneIdEntry[] = [];

  customCharacters: Partial<Character>[] = [];

  favorites: Favorites = { lists: [], workshops: [], rotations: [], rotationFolders: [] };

  contacts: string[] = [];

  admin = false;

  moderator = false;

  patron = false;

  defaultConsumables: DefaultConsumables;

  patreonToken?: string;

  patreonRefreshToken?: string;

  lastPatreonRefresh?: number;

  nickname: string;

  logProgression: number[] = [];
  gatheringLogProgression: number[] = [];

  itemTags: { id: number, tag: string }[] = [];

  stats: any = {};

  cid?: string;
  world?: number;
}
