import { DataWithPermissions } from '../../../core/database/permissions/data-with-permissions';
import * as firebase from 'firebase/app';
import { CraftingReplayStep } from './crafting-replay-step';
import { CrafterStats } from '@ffxiv-teamcraft/simulator';

export class CraftingReplay extends DataWithPermissions {

  public endTime: firebase.firestore.Timestamp;

  public steps: CraftingReplayStep[] = [];

  public online = false;

  public hash?: string;

  constructor(public $key: string, public itemId: number, public recipeId: number, public startTime: firebase.firestore.Timestamp, public playerStats: CrafterStats) {
    super();
  }
}
