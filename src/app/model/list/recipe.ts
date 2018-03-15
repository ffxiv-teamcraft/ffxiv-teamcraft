import {CompactMasterbook} from './compact-masterbook';
import {I18nName} from './i18n-name';

export interface Recipe {
    // We sometimes have an id property, TODO: remove that and its attributions.
    id?: number;
    amount?: number;
    recipeId: string;
    itemId: number;
    job: number;
    stars: number;
    masterbook?: CompactMasterbook;
    lvl: number;
    icon: string;
    url_xivdb?: I18nName;
    collectible: boolean;
}
