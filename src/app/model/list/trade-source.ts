import {Trade} from './trade';

export interface TradeSource {
    npcId: number;
    zoneId?: number;
    areaId?: number;
    trades: Trade[];
    coords?: { x: number; y: number; };
}
