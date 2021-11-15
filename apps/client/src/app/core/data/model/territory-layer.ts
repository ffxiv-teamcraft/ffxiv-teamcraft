import { Vector3 } from '../../tools/vector3';

export interface TerritoryLayer {
  mapId: number;
  index: number;
  placeNameId: number;
  ignored?: boolean;
  bounds: Vector3<{ min: number, max: number }>
}
