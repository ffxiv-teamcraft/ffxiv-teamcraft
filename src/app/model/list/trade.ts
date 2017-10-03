import {I18nName} from './i18n-name';

export interface Trade {
    itemIcon: string;
    itemAmount: number;
    itemName: I18nName;
    itemHQ: boolean;
    currencyIcon: string;
    currencyAmount: number;
    currencyName: I18nName;
}
