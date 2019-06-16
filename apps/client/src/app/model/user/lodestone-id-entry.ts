import { GearSet } from '@ffxiv-teamcraft/simulator';
import { Character } from '@xivapi/angular-client';

export interface LodestoneIdEntry {
  id: number;
  verified: boolean;
  stats?: GearSet[];
  masterbooks?: number[];
  character?: Character;
}
