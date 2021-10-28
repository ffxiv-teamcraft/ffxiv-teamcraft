import { DataWithPermissions } from '../../../core/database/permissions/data-with-permissions';
import firebase from 'firebase/compat/app';
import { CraftingReplayStep } from './crafting-replay-step';
import { CrafterStats } from '@ffxiv-teamcraft/simulator';
import { DeserializeAs } from '@kaiu/serializer';

export class CraftingReplay extends DataWithPermissions {

  public endTime: firebase.firestore.Timestamp;

  public steps: CraftingReplayStep[] = [];

  public online = false;

  public hash?: string;

  @DeserializeAs(CrafterStats)
  public playerStats: CrafterStats;

  constructor(public $key: string,
              public itemId: number,
              public recipeId: number,
              public startTime: firebase.firestore.Timestamp,
              playerStats: CrafterStats) {
    super();
    this.playerStats = playerStats;
  }
}
