import {Trade} from './trade';

export interface TradeSource {
    npcId: number;
    zoneId: number;
    trades: Trade[];
    currencyAmount: number;
    itemAmount: number;
}
