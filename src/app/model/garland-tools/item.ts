import {Craft} from './craft';
import {I18nData} from '../list/i18n-data';
import {TradeData} from './trade-data';

export interface Item extends I18nData {
    id: number;
    patch: number;
    patchCategory: number;
    ilvl: number;
    category: number;
    rarity: number;
    icon: number;
    strengths: string[];
    attr: Attr;

    tradeable?: number;
    craft?: Craft[];
    vendors?: number[];
    tradeSources?: { [index: number]: TradeData };
    drops?: number[];
    nodes?: number[];
    ventures?: number[];
    voyages?: string[];
    instances?: number[];
    reducedFrom?: number[];
    desynthedFrom?: number[];
    fishingSpots?: number[];
    seeds?: number[];
}
