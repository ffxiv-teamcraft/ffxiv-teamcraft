import { BasePacket } from './BasePacket';

export interface PlayerSetup extends BasePacket {
  contentID: string;
  unknown8: number;
  unknownC: number;
  charID: number;
  restedXP: number;
  companionCurrentXP: number;
  unknown1C: number;
  fishCaught: number;
  useBaitCatalogID: number;
  unknown28: number;
  unknownPVP2C: number;
  unknown3: number;
  pvpFrontlineOverallCampaigns: number;
  unknown34: number;
  name: string;
}