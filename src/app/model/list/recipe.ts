import {CompactMasterbook} from './compact-masterbook';
import {I18nName} from './i18n-name';
import {SearchResult} from './search-result';

export interface Recipe extends SearchResult {
    // We sometimes have an id property, TODO: remove that and its attributions.
    id?: number;
    amount?: number;
    recipeId: string;
    job: number;
    stars: number;
    masterbook?: CompactMasterbook;
    lvl: number;
    url_xivdb?: I18nName;
    collectible: boolean;
}
