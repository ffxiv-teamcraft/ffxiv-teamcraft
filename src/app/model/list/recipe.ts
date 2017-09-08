import {CompactMasterbook} from './compact-masterbook';
import {I18nName} from './i18n-name';
export interface Recipe {
    recipeId: number;
    itemId: number;
    job: number;
    stars: number;
    masterbook?: CompactMasterbook;
    name: I18nName;
    lvl: number;
    icon: number;
    url_xivdb: I18nName;
}
