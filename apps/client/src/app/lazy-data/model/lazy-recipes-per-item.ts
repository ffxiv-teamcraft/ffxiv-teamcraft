export interface LazyRecipesPerItem {
  id:                     number;
  job:                    number;
  lvl:                    number;
  yields:                 number;
  result:                 number;
  stars:                  number;
  qs:                     boolean;
  hq:                     boolean;
  durability:             number;
  quality:                number;
  progress:               number;
  suggestedControl:       number;
  suggestedCraftsmanship: number;
  controlReq:             number;
  craftsmanshipReq:       number;
  rlvl:                   number;
  ingredients:            Ingredient[];
  expert:                 boolean;
  conditionsFlag:         number;
  masterbook?:            number;
}

export interface Ingredient {
  id:      number;
  amount:  number;
  quality: number;
}
