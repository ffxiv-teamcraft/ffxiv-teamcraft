import { Vector2 } from "../../core/vector2";


export interface FateData {
  id: number;
  level: number;
  coords?: Vector2;
  zoneId?: number;
  mapId?: number;
}
