export type BonusType = 'CP' | 'Craftsmanship' | 'Control';

export interface ConsumableBonus {
  type: BonusType;
  value: number;
  max: number;
}
