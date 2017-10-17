import {I18nName} from './i18n-name';

export interface StoredNode {
    zoneid: number;
    areaid: number;
    limitType: I18nName;
    coords: number[];
    time?: number[];
    uptime?: number;
    slot?: number;
}
