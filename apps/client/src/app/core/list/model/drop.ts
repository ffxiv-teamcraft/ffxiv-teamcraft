import { MonsterLocation } from '../../data/monster-location';

export interface Drop {
  id: number;
  zoneid: number;
  lvl: string;
  position: MonsterLocation;
}
