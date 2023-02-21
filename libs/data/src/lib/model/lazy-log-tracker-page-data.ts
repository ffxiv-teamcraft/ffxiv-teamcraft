export interface LazyLogTrackerPageData {
  divisionId:             number;
  id:                     number;
  items?:                 Item[];
  masterbook?:            number | null;
  recipes?:               Recipe[];
  requiredForAchievement: boolean;
  startLevel:             number;
}

export interface Item {
  hidden: number;
  ilvl:   number;
  itemId: number;
  lvl:    number;
  nodes:  any[];
  stars:  number;
}

export interface Recipe {
  itemId:   number;
  leves:    number[];
  recipeId: number;
  rlvl:     number;
}
