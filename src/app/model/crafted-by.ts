import {CompactMasterbook} from './garland-tools/compact-masterbook';
export interface CraftedBy {
    itemId: number;
    icon: string;
    level: number;
    stars_tooltip: string;
    stars_html?: string;
    masterbook?: CompactMasterbook;
}
