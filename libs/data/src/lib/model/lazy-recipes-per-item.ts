export interface LazyRecipesPerItem {
  conditionsFlag:         number;
  controlReq:             number;
  craftsmanshipReq:       number;
  durability:             number;
  expert:                 boolean;
  hq:                     boolean;
  id:                     number | string;
  ingredients:            Ingredient[];
  isIslandRecipe?:        boolean;
  job:                    number;
  lvl:                    number;
  masterbook?:            number;
  progress:               number;
  progressDivider:        number;
  progressModifier:       number;
  qs:                     boolean;
  quality:                number;
  qualityDivider:         number;
  qualityModifier:        number;
  requiredQuality:        number;
  result:                 number;
  rlvl:                   number;
  stars?:                 number;
  suggestedControl:       number;
  suggestedCraftsmanship: number;
  yields:                 number;
}

export interface Ingredient {
  amount:  number;
  id:      number;
  quality: number;
}
