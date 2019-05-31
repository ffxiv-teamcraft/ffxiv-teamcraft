import { Vector2 } from '../tools/vector2';

export interface Aetheryte {
  id: number;
  zoneid: number;
  placenameid: number;
  map: number;
  x: number;
  y: number;
  type: number;
  nameid: number;
  aethernetCoords?: Vector2;
}
