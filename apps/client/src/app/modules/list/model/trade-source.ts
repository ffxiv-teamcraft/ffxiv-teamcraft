import { Trade } from './trade';
import { TradeNpc } from './trade-npc';
import { I18nName } from '../../../model/common/i18n-name';

export interface TradeSource {
  // The name of the shop, only in english for now
  shopName: string | I18nName;
  npcs: TradeNpc[];
  trades: Trade[];
}
