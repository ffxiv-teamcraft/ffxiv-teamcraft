import {CompactMasterbook} from './compact-masterbook';
export interface CraftedBy {
    icon: string;
    level: number;
    stars_tooltip: string;
    stars_html?: string;
    masterbook?: CompactMasterbook;
}
