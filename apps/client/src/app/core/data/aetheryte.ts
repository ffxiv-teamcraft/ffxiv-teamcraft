import { Vector3 } from '../tools/vector3';
import { Vector2 } from '../tools/vector2';

export interface Aetheryte extends Vector3 {
  id: number;
  zoneid: number;
  map: number;
  type: number;
  nameid: number;
  aethernetCoords?: Vector2;
}
