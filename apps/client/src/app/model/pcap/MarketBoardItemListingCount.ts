import { BasePacket } from './BasePacket';

export interface MarketBoardItemListingCount extends BasePacket {
  itemCatalogId: number;
  requestId: number;
  quantity: number;
}