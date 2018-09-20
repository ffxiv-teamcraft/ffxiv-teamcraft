import { Trade } from './trade';

export interface TradeSource {
  // The name of the shop, only in english for now
  shopName: string;
  npcId: number;
  zoneId?: number;
  areaId?: number;
  trades: Trade[];
  coords?: { x: number; y: number; };
}
