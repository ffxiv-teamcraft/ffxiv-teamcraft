import {Craft} from './craft';
import {I18nDataRow} from '../i18n-data-row';

export interface Item {
    id: number;
    en: I18nDataRow;
    ja: I18nDataRow;
    de: I18nDataRow;
    fr: I18nDataRow;
    patch: number;
    patchCategory: number;
    price: number;
    ilvl: number;
    category: number;
    tradeable: number;
    sell_price: number;
    rarity: number;
    icon: number;
    craft: Craft[];
    cost: number;
    skill_angle: number;
    aoe: number;
    strengths: string[];
    attr: Attr;
}
