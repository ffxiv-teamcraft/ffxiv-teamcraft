import { Aetheryte } from '../data/aetheryte';
import { Observable } from 'rxjs';
import { Vector2 } from '../tools/vector2';

export interface Alarm {
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

  aetheryte$?: Observable<Aetheryte>;

  groupName?: string;

  note?: string;
}
