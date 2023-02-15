import { Vector3 } from '../core';

export interface TerritoryLayer {
  mapId: number;
  index: number;
  placeNameId: number;
  ignored?: boolean;
  bounds: Vector3<{ min: number, max: number }>;
}
