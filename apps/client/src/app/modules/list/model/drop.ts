import { MonsterLocation } from '../../../core/data/monster-location';

export interface Drop {
  id: number;
  mapid?: number;
  zoneid?: number;
  lvl?: string;
  position?: MonsterLocation;
}
