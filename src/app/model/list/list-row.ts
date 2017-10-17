import {I18nName} from './i18n-name';
import {CraftedBy} from './crafted-by';
import {GatheredBy} from './gathered-by';
import {Drop} from 'app/model/list/drop';
import {TradeSource} from './trade-source';
import {Instance} from './instance';
import {Vendor} from './vendor';
import {Ingredient} from '../garland-tools/ingredient';

export class ListRow {
    addedAt: number;
    icon?: number;
    id: number;
    amount: number;
    amount_needed?: number;
    done: number;
    requires?: Ingredient[];
    recipeId?: string;
    yield: number;

    craftedBy?: CraftedBy[];
    gatheredBy?: GatheredBy;
    gardening?: boolean;
    drops?: Drop[];
    tradeSources?: TradeSource[];
    instances?: Instance[];
    reducedFrom?: number[];
    desynths?: number[];
    vendors?: Vendor[];
    voyages?: I18nName[];

    hidden?: boolean;
}
