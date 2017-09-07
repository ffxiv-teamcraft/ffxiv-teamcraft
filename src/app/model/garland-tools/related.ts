import {I18nDataRow} from '../i18n-data-row';
import {Craft} from './craft';

export interface Related {
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
    seeds: number[];
    craft: Craft[];
    leves: number[];
    drops: any[];
    instances: number[];
    ventures: number[];
    usedInQuest: number[];
    nodes: number[];
    vendors: number[];
    quests: number[];
}
