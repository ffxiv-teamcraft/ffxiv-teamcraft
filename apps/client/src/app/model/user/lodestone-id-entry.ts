import { Character } from '@xivapi/angular-client';
import { TeamcraftGearsetStats } from './teamcraft-gearset-stats';

export interface LodestoneIdEntry {
  id: number;
  verified: boolean;
  stats?: TeamcraftGearsetStats[];
  masterbooks?: number[];
  character?: Character;
  contentId?: string;
}
