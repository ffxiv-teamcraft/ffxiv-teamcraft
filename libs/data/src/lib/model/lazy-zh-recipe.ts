export interface LazyZhRecipe {
  conditionsFlag:         number;
  controlReq:             number;
  craftsmanshipReq:       number;
  durability:             number;
  expert:                 boolean;
  hq:                     boolean;
  id:                     number;
  ingredients:            Ingredient[];
  job:                    number;
  lvl:                    number;
  progress:               number;
  progressDivider:        number;
  progressModifier:       number;
  qs:                     boolean;
  quality:                number;
  qualityDivider:         number;
  qualityModifier:        number;
  result:                 number;
  rlvl:                   number;
  stars:                  number;
  suggestedControl:       number;
  suggestedCraftsmanship: number;
  yields:                 number;
}

export interface Ingredient {
  amount:  number;
  id:      number;
  quality: number | null;
}
