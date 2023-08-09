import { CompactMasterbook } from "../details-model/compact-masterbook";
import { LazyRecipe } from '@ffxiv-teamcraft/data/model/lazy-recipe';

export interface CraftedBy {
  itemId: number | string;
  lvl: number;
  stars_tooltip: string;
  id: string;
  job: number;
  yield: number;
  ingredients: LazyRecipe['ingredients'];
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
  isIslandRecipe?: boolean;
}
