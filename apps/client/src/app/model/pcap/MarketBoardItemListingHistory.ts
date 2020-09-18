import { BasePacket } from './BasePacket';

export interface MarketBoardItemListingHistory extends BasePacket {
  itemID: number;
  itemCatalogId: number;
  itemCatalogId2: number;

  listings: {
    salePrice: number;
    purchaseTime: number;
    quantity: number;
    hq: number;
    onMannequin: number;
    buyerName: string;
    itemCatalogId: number;
  }[];
}