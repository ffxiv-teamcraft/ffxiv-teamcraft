import {I18nName} from './i18n-name';
import {CraftedBy} from './crafted-by';
import {GatheredBy} from './gathered-by';
import {Drop} from 'app/model/garland-tools/drop';
import {TradeSource} from './garland-tools/trade-source';
import {Instance} from './garland-tools/instance';
import {Vendor} from './garland-tools/vendor';
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
    desynths?: I18nName[];
    vendors?: Vendor[];

    hidden?: boolean;
}
