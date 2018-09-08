import { Vector2 } from '../tools/vector2';
import { DataModel } from '../database/storage/data-model';
import { ForeignKey } from '../database/relational/foreign-key';
import { TeamcraftUser } from '../../model/user/teamcraft-user';
import { Aetheryte } from '../data/aetheryte';

export class Alarm extends DataModel {

  @ForeignKey(TeamcraftUser)
  userId: string;

  itemId: number;
  icon: number;
  spawn: number;
  duration: number;
  slot: number | string;
  zoneId: number;
  areaId: number;
  coords: Vector2;
  /**
   * Type of the node.
   * 0,1 = MIN
   * 2,3 = BOT
   * 4 = FSH (Spearfishing)
   */
  type: number;

  groupName: string;

  note: string;

  aetheryte: Aetheryte;

  constructor(alarmData?: Partial<Alarm>) {
    super();
    if (alarmData) {
      Object.assign(this, alarmData);
    }
  }
}
