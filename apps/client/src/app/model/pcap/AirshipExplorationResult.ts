import { BasePacket } from './BasePacket';

export interface AirshipExplorationResult extends BasePacket {
  rating: number,
  airshipSpeed: number,
  explorationResult: {
    exp: number,
    favorResult: number,
    sectorId: number,
    discoveredSectorId: number,
    expRating: number,

    unknown0: number,

    loot1ItemId: number,
    loot2ItemId: number,
    loot1Quantity: number,
    loot2Quantity: number,
    loot1SurveillanceResult: number,
    loot2SurveillanceResult: number,
    loot1RetrievalResult: number,
    loot2RetrievalResult: number,
    loot1ItemDiscoveryDescription: number,
    loot2ItemDiscoveryDescription: number,

    unknown1: number,
    unknown2: number,

    doubleDip: boolean,
    loot1IsHq: boolean,
    loot2IsHq: boolean,

    unknown3: number,
  }[]
}
