import {I18nName} from './i18n-name';
import {CraftedBy} from './crafted-by';
import {GatheredBy} from './gathered-by';
import {Drop} from 'app/model/list/drop';
import {TradeSource} from './trade-source';
import {Instance} from './instance';
import {Vendor} from './vendor';
import {Ingredient} from '../garland-tools/ingredient';
import {ResourceComment} from '../../modules/comments/resource-comment';
import {DeserializeAs} from '@kaiu/serializer';
import {DataModel} from '../../core/database/storage/data-model';

export class ListRow extends DataModel {
    icon?: number;
    id: number;
    // The amount of items needed for the craft.
    amount: number;
    // The amount of crafts needed to get the amount of items needed.
    amount_needed?: number;
    done: number;
    used: number;
    requires?: Ingredient[] = [];
    recipeId?: string;
    yield: number;

    craftedBy?: CraftedBy[] = [];
    gatheredBy?: GatheredBy;
    gardening?: boolean;
    drops?: Drop[] = [];
    tradeSources?: TradeSource[] = [];
    instances?: Instance[];
    reducedFrom?: any[] = [];
    desynths?: number[] = [];
    vendors?: Vendor[] = [];
    voyages?: I18nName[] = [];
    ventures?: number[] = [];

    /**
     * Is someone working on it?
     */
    workingOnIt?: string;

    @DeserializeAs([ResourceComment])
    comments?: ResourceComment[];

    hidden?: boolean;
}
