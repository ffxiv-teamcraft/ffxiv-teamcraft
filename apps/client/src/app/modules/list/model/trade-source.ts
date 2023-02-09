import { Trade } from './trade';
import { TradeNpc } from './trade-npc';
import { I18nName } from '@ffxiv-teamcraft/types';

export interface TradeSource {
  // Useful for debugging stuff
  id?: number;
  type?: string;
  shopName?: I18nName;
  npcs: TradeNpc[];
  trades: Trade[];
}
