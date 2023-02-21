import { MonsterLocation } from '../details-model/monster-location';


export interface Drop {
  id: number;
  mapid?: number;
  zoneid?: number;
  lvl?: string;
  position?: MonsterLocation;
}
