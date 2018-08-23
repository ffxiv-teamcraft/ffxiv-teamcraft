import { ConsumableDataRow } from './consumable-data-row';
import { BonusType } from './consumable-bonus';
import { Injectable } from '@angular/core';
import { Consumable } from './consumable';

@Injectable()
export class ConsumablesService {

  fromData(data: ConsumableDataRow[]): Consumable[] {
    return [].concat.call([], ...data.map(row => {
      const consumables: Consumable[] = [new Consumable(row.itemId), new Consumable(row.itemId, true)];
      for (const bonus of ['CP', 'Craftsmanship', 'Control']) {
        if (row[bonus] !== undefined) {
          consumables[0].bonuses.push({
            type: <BonusType>bonus,
            value: row[bonus][0].amount,
            max: row[bonus][0].max
          });
          consumables[1].bonuses.push({
            type: <BonusType>bonus,
            value: row[bonus][1].amount,
            max: row[bonus][1].max
          });
        }
      }
      return consumables;
    }));
  }
}
