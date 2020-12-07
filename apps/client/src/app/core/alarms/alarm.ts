import { Vector2 } from '../tools/vector2';
import { DataModel } from '../database/storage/data-model';
import { ForeignKey } from '../database/relational/foreign-key';
import { TeamcraftUser } from '../../model/user/teamcraft-user';
import { Aetheryte } from '../data/aetheryte';
import { AlarmGroup } from './alarm-group';
import { CompactMasterbook } from '../../model/common/compact-masterbook';
import { FishingBait } from '../../modules/list/model/fishing-bait';
import { Vector3 } from '../tools/vector3';

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
  coords: Vector3;
  /**
   * Type of the node.
   * 0,1 = MIN
   * 2,3 = BOT
   * 4 = FSH
   */
  type: number;

  /**
   * With 5.4, SE changes fish eyes so it allows to ignore time requirement,
   * because of that, this boolean now indicates if the alarm is only possible
   * with fishEyes enabled.
   */
  fishEyes?: boolean;

  baits?: FishingBait[];
  gig?: string;
  weathers?: number[];
  weathersFrom?: number[];
  snagging?: boolean;
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
