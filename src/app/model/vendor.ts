import { I18nName } from './i18n-name';
export interface Vendor {
    npcName: string;
    zoneName: I18nName;
    gilsAmount: number;
    coords?: { x: number; y: number; };
}
