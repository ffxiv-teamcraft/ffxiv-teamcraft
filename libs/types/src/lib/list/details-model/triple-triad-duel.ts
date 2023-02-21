import { Vector2 } from "../../core/vector2";

export interface TripleTriadDuel {
  atttNpcId: number;
  npcId: number;
  mapId: number;
  zoneId: number;
  coords: Vector2;
  rules: number[];
  unlockingQuestId?: number;
}
