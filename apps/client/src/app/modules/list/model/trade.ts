import { TradeEntry } from './trade-entry';

export interface Trade {
  items: TradeEntry[];
  currencies: TradeEntry[];
  requiredGCRank?: number;
  requiredFateRank?: number;
}
