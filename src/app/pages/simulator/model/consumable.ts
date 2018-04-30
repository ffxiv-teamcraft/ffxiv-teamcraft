import {ConsumableDataRow} from './consumable-data-row';
import {BonusType, ConsumableBonus} from './consumable-bonus';

export class Consumable {

    bonuses: ConsumableBonus[] = [];

    static fromData(data: ConsumableDataRow[]): Consumable[] {
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

    public constructor(public itemId: number, public hq = false) {
    }

    getBonus(type: BonusType): ConsumableBonus {
        return this.bonuses.find(b => b.type === type);
    }
}
