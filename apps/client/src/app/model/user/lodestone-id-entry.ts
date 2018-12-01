import { GearSet } from '../../pages/simulator/model/gear-set';
import { Character } from '@xivapi/angular-client';

export interface LodestoneIdEntry {
  id: number;
  verified: boolean;
  stats?: GearSet[];
  masterbooks?: number[];
  character?: Character;
}
