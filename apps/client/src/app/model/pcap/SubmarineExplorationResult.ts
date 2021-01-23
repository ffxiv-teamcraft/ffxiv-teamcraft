import { BasePacket } from './BasePacket';

export interface SubmarineExplorationResult extends BasePacket {
  explorationResult: {
    sectorId: number,
    unknown0: number,
    unknown1: number,
    unknown2: number,
    favorResult: number,
    exp: number,
    loot1ItemId: number,
    loot2ItemId: number,
    loot1Quantity: number,
    loot2Quantity: number,
    loot1IsHq: boolean,
    loot2IsHq: boolean,
    loot1SurveillanceResult: number,
    loot2SurveillanceResult: number,
    loot1RetrievalResult: number,
    loot2RetrievalResult: number,
    loot1ItemDiscoveryDescription: number,
    loot2ItemDiscoveryDescription: number,
    unknown3: number,
  }[]
}
