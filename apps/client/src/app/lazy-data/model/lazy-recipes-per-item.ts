export interface LazyRecipesPerItem {
  id:                     number | string;
  job:                    number;
  lvl:                    number;
  yields:                 number;
  result:                 number;
  stars?:                 number;
  qs:                     boolean;
  hq:                     boolean;
  durability:             number;
  quality:                number;
  progress:               number;
  suggestedControl:       number;
  suggestedCraftsmanship: number;
  progressDivider:        number;
  qualityDivider:         number;
  progressModifier:       number;
  qualityModifier:        number;
  controlReq:             number;
  craftsmanshipReq:       number;
  rlvl:                   number;
  requiredQuality:        number;
  ingredients:            Ingredient[];
  expert:                 boolean;
  conditionsFlag:         number;
  masterbook?:            number;
  isIslandRecipe?:        boolean;
}

export interface Ingredient {
  id:      number;
  amount:  number;
  quality: number | null;
}
