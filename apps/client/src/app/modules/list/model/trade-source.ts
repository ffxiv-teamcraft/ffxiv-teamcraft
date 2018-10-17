import { Trade } from './trade';
import { TradeNpc } from './trade-npc';

export interface TradeSource {
  // The name of the shop, only in english for now
  shopName: string;
  npcs: TradeNpc[];
  trades: Trade[];
}
