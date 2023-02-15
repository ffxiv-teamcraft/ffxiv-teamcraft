import { Vector2 } from '../../core/vector2';

export interface MonsterLocation extends Vector2 {
  zoneid: number;
  fate?: number;
}
