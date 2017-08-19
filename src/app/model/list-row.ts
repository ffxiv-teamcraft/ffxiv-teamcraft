import {I18nName} from './i18n-name';
import {CraftedBy} from './crafted-by';
import {GatheredBy} from './gathered-by';
import {Drop} from 'app/model/garland-tools/drop';
import {TradeSource} from './trade-source';
import {Instance} from './instance';
export interface ListRow {
    addedAt: number;
    name: I18nName;
    icon?: string;
    id: number;
    amount: number;
    done: number;
    requires?: ListRow[];
    recipeId?: number;
    yield: number;

    craftedBy?: CraftedBy[];
    gatheredBy?: GatheredBy;
    gardening?: boolean;
    drops?: Drop[];
    tradeSources?: TradeSource[];
    instances?: Instance[];
    reducedFrom?: I18nName[];
}
