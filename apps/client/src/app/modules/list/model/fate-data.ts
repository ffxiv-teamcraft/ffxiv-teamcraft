import { Vector2 } from '@ffxiv-teamcraft/types';

export interface FateData {
  id: number;
  level: number;
  coords?: Vector2;
  zoneId?: number;
  mapId?: number;
}
