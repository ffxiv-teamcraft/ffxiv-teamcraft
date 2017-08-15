import {CraftedBy} from './crafted-by';
import {I18nName} from './i18n-name';
export interface ListRow {
    name?: I18nName;
    icon?: string;
    id: number;
    amount: number;
    done: number;
    requires?: ListRow[];
    craftedBy?: CraftedBy[];
}
