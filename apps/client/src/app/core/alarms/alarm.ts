import { Vector2 } from '../tools/vector2';
import { RelationalDataModel } from '../database/storage/relational-data-model';

export interface Alarm extends RelationalDataModel {
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

  groupName?: string;

  note?: string;
}
