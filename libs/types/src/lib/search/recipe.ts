import { I18nName } from '../i18n-name';

export interface Recipe {
  itemId: number;
  icon?: string;
  recipeId: string;
  job: number;
  stars: number;
  masterbook?: {
    id: number | string;
    name?: I18nName;
  };
  lvl: number;
  collectible: boolean;
}
