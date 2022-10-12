import { DataWithPermissions } from '../../../core/database/permissions/data-with-permissions';
import { CraftingReplayStep } from './crafting-replay-step';
import { CrafterStats } from '@ffxiv-teamcraft/simulator';
import { DeserializeAs } from '@kaiu/serializer';
import { Timestamp } from '@angular/fire/firestore';

export class CraftingReplay extends DataWithPermissions {

  public endTime: Timestamp;

  public steps: CraftingReplayStep[] = [];

  public online = false;

  public hash?: string;

  @DeserializeAs(CrafterStats)
  public playerStats: CrafterStats;

  constructor(public $key: string,
              public itemId: number,
              public recipeId: number,
              public startTime: Timestamp,
              playerStats: CrafterStats) {
    super();
    this.playerStats = playerStats;
  }
}
