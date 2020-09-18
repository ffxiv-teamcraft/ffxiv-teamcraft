import { BasePacket } from './BasePacket';

export interface MarketBoardSearchResult extends BasePacket {
  items: {
    itemCatalogID: number;
    quantity: number;
    demand: number;
  }[];
  itemIndexEnd: number;
  itemIndexStart: number;
  requestID: number;
}