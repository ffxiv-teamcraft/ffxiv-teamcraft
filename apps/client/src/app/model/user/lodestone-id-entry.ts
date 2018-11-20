import { GearSet } from '../../pages/simulator/model/gear-set';

export interface LodestoneIdEntry {
  id: number;
  verified: boolean;
  stats?: GearSet[];
  masterbooks?: number[];
}
