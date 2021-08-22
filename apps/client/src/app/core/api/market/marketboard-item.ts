import { MarketboardPrice } from './marketboard-price';
import { MarketboardHistory } from './marketboard-history';

export interface MarketboardItem {
  ID: string;
  ItemId: number;
  History: MarketboardHistory[];
  Prices: MarketboardPrice[];
  Server: number;
  Updated: number;

  currentAveragePriceHQ: number;
  currentAveragePriceNQ: number;
  hqSaleVelocity: number;
  nqSaleVelocity: number;
}
