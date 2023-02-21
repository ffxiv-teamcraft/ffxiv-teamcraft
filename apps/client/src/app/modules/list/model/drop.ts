import { MonsterLocation } from "@ffxiv-teamcraft/types";

export interface Drop {
  id: number;
  mapid?: number;
  zoneid?: number;
  lvl?: string;
  position?: MonsterLocation;
}
