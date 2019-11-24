import { Vector2 } from '../tools/vector2';
import { DataModel } from '../database/storage/data-model';
import { ForeignKey } from '../database/relational/foreign-key';
import { TeamcraftUser } from '../../model/user/teamcraft-user';
import { Aetheryte } from '../data/aetheryte';
import { AlarmGroup } from './alarm-group';
import { CompactMasterbook } from '../../model/common/compact-masterbook';
import { FishingBait } from '../../modules/list/model/fishing-bait';

export class Alarm extends DataModel {

  @ForeignKey(TeamcraftUser)
  userId?: string;

  @ForeignKey(AlarmGroup)
  groupId?: string;

  itemId: number;
  // Use for custom alarms
  name?: string;
  icon: number;
  spawns: number[];
  duration: number;
  slot: number | string;
  zoneId: number;
  mapId: number;
  coords: Vector2;
  /**
   * Type of the node.
   * 0,1 = MIN
   * 2,3 = BOT
   * 4 = FSH
   */
  type: number;

  baits?: FishingBait[];
  gig?: string;
  weathers?: number[];
  weathersFrom?: number[];
  snagging?: boolean;
  fishEyes?: boolean;
  predators?: { id: number, icon: number, amount: number }[];

  note: string;

  aetheryte: Aetheryte;

  folklore?: CompactMasterbook;

  reduction?: boolean;

  ephemeral?: boolean;

  nodeContent?: any;

  enabled = true;

  constructor(alarmData?: Partial<Alarm>) {
    super();
    if (alarmData) {
      Object.assign(this, alarmData);
    }
  }
}
