import {I18nName} from './i18n-name';
import {CraftedBy} from './crafted-by';
import {GatheredBy} from './gathered-by';
export interface ListRow {
    name: I18nName;
    icon?: string;
    id: number;
    amount: number;
    done: number;
    requires?: ListRow[];
    recipeId?: number;

    craftedBy?: CraftedBy[];
    gatheredBy?: GatheredBy;
}
