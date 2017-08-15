import {CraftedBy} from './crafted-by';
export interface ListRow {
    name?: string;
    icon?: string;
    id: number;
    amount: number;
    done: number;
    requires?: ListRow[];
    craftedBy?: CraftedBy[];
}
