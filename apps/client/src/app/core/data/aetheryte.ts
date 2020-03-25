import { Vector2 } from '../tools/vector2';

export interface Aetheryte {
  id: number;
  zoneid: number;
  map: number;
  x: number;
  y: number;
  z: number;
  type: number;
  nameid: number;
  aethernetCoords?: Vector2;
}
