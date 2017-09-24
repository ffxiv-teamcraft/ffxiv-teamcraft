import {I18nName} from './i18n-name';
export interface Vendor {
    npcName: I18nName;
    zoneName: I18nName;
    price: number;
    coords?: { x: number; y: number; };
}
