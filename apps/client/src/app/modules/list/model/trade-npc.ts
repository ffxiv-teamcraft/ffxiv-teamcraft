import { Vector2 } from '@ffxiv-teamcraft/types';

export interface TradeNpc {
  id: number;
  coords?: Vector2;
  mapId?: number;
  zoneId?: number;
  areaId?: number;
  festival?: number;
}
