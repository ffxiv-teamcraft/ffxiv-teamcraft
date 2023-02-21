import { I18nName } from '../../i18n-name';
import { Trade } from './trade';
import { TradeNpc } from './trade-npc';


export interface TradeSource {
  // Useful for debugging stuff
  id?: number;
  type?: string;
  shopName?: I18nName;
  npcs: TradeNpc[];
  trades: Trade[];
}
