import { MonsterLocation } from '../../../core/data/monster-location';

export interface Drop {
  id: number;
  zoneid: number;
  lvl: string;
  position: MonsterLocation;
}
