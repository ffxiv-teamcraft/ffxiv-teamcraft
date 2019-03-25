import { Complexity } from './complexity';
import { Ingredient } from './ingredient';
import { RecipeElement } from './recipe-element';

export interface Craft {
  id: string;
  job: number;
  rlvl: number;
  durability: number;
  quality: number;
  progress: number;
  lvl: number;
  stars?: number;
  hq: 1 | 0;
  quickSynth: 1 | 0;
  controlReq?: number;
  craftsmanshipReq?: number;
  unlockId?: number;
  ingredients: Ingredient[];
  complexity: Complexity;
  fc?: number;
  yield?: number;
  element?: RecipeElement;
}
