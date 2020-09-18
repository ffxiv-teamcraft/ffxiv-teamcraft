import { BasePacket } from './BasePacket';

export interface MarketBoardItemListing extends BasePacket {
  itemID: number;
  listings: {
    listingID: string;
    retainerID: string;
    retainerOwnerID: string;
    artisanID: string;
    pricePerUnit: number;
    totalTax: number;
    quantity: number;
    // Just for convenience; this value isn't in the packet.
    total: number;
    lastReviewTime: number;
    containerID: number;
    slotID: number;
    durability: number;
    spiritbond: number;
    materia: [number, number, number, number, number];
    retainerName: string;
    playerName: string;
    hq: number;
    materiaCount: number;
    onMannequin: number;
    city: StringConstructor;
    dyeID: number;
  }[];
}