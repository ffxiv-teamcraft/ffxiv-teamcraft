import { BonusType } from './consumable-bonus';

export class FreeCompanyAction {

  public constructor(public actionId: number, public type: BonusType, public value: number) {
  }
}
