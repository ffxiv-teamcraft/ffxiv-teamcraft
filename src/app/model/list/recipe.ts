import {CompactMasterbook} from './compact-masterbook';
import {I18nName} from './i18n-name';

export interface Recipe {
    amount?: number;
    recipeId: string;
    itemId: number;
    job: number;
    stars: number;
    masterbook?: CompactMasterbook;
    lvl: number;
    icon: string;
    url_xivdb?: I18nName;
}
