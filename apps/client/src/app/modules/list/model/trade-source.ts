import { Trade } from './trade';
import { TradeNpc } from './trade-npc';
import { I18nName } from '../../../model/common/i18n-name';

export interface TradeSource {
  // Useful for debugging stuff
  id?: number;
  type?: string;
  shopName?: I18nName;
  npcs: TradeNpc[];
  trades: Trade[];
}
