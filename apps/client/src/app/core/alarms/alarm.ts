import { DataModel } from '../database/storage/data-model';
import { ForeignKey } from '../database/relational/foreign-key';
import { TeamcraftUser } from '../../model/user/teamcraft-user';
import { Aetheryte } from '../data/aetheryte';
import { Vector3 } from '../tools/vector3';
import { FishingBait } from '../data/model/fishing-bait';
import { Hookset } from '../data/model/hookset';
import { SpearfishingSpeed } from '../data/model/spearfishing-speed';
import { SpearfishingShadowSize } from '../data/model/spearfishing-shadow-size';

export class Alarm extends DataModel {

  @ForeignKey(TeamcraftUser)
  userId?: string;
  groupNames?: string;

  itemId: number;
  nodeId?: number;
  // Use for custom alarms
  name?: string;
  spawns: number[];
  duration: number;
  zoneId: number;
  areaId: number;
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

  hookset?: Hookset;
  baits?: FishingBait[];
  weathers?: number[];
  weathersFrom?: number[];
  snagging?: boolean;
  predators?: { id: number, amount: number }[];
  speed?: SpearfishingSpeed;
  shadowSize?: SpearfishingShadowSize;

  note: string;

  aetheryte?: Aetheryte;

  folklore?: number;

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
