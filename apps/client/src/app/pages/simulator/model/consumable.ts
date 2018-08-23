import { BonusType, ConsumableBonus } from './consumable-bonus';

export class Consumable {

  bonuses: ConsumableBonus[] = [];

  public constructor(public itemId: number, public hq = false) {
  }

  getBonus(type: BonusType): ConsumableBonus {
    return this.bonuses.find(b => b.type === type);
  }
}
