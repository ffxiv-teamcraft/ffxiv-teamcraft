import { CompactMasterbook } from '../../../model/common/compact-masterbook';
import { Ingredient } from '../../../model/garland-tools/ingredient';
import { Complexity } from '../../../model/garland-tools/complexity';

export interface CraftedBy {
  itemId: number | string;
  icon: string;
  lvl: number;
  stars_tooltip: string;
  id: string;
  job: number;
  yield: number;
  masterbook?: CompactMasterbook;
  rlvl?: number;
  durability?: number;
  progression?: number;
  quality?: number;
  hq?: 1 | 0;
  quickSynth?: 1 | 0;
  controlReq?: number;
  craftsmanshipReq?: number;
  unlockId?: number;
  complexity?: Complexity;
}
