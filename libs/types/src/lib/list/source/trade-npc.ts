import { Vector2 } from '../../core/vector2';

export interface TradeNpc {
  id: number;
  coords?: Vector2;
  mapId?: number;
  zoneId?: number;
  areaId?: number;
  festival?: number;
}
