import {I18nName} from './i18n-name';
import {Trade} from './trade';
export interface TradeSource {
    npcName: I18nName;
    zoneName: I18nName;
    trades: Trade[];
    currencyAmount: number;
    itemAmount: number;
}
