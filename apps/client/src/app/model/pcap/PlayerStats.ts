import { BasePacket } from './BasePacket';

export interface PlayerStats extends BasePacket {
  dexterity: number;
  vitality: number;
  intelligence: number;
  mind: number;
  piety: number;
  hp: number;
  mp: number;
  gp: number;
  cp: number;
  tenacity: number;
  attackPower: number;
  defense: number;
  directHit: number;
  magicDefense: number;
  criticalHit: number;
  attackMagicPotency: number;
  strength: number;
  healingMagicPotency: number;
  determination: number;
  skillSpeed: number;
  spellSpeed: number;
  craftsmanship: number;
  control: number;
  gathering: number;
  perception: number;
}