import { combineLatest } from 'rxjs';
import { AbstractExtractor } from '../abstract-extractor';
import { XivDataService } from '../xiv/xiv-data.service';

export class ConsumablesExtractor extends AbstractExtractor {
  protected doExtract(xiv: XivDataService): any {
    const foods = [];
    const medicines = [];
    combineLatest([
      this.getSheet<any>(xiv, 'Item', ['ItemSearchCategory#', 'LevelItem#', 'LevelEquip#', 'ItemAction.Type#', 'ItemAction.Data#'], false, 1),
      this.getSheet<any>(xiv, 'ItemFood', null, false, 1)
    ])
      .subscribe(([items, itemFoods]) => {
        items.forEach(item => {
          if ([844, 845, 846].includes(item.ItemAction.Type)) {
            const bonus = this.computeBonuses(itemFoods.find(a => a.index === item.ItemAction.Data[1]));
            const consumable = {
              ID: item.index,
              LevelEquip: item.LevelEquip,
              LevelItem: item.LevelItem,
              Bonuses: bonus
            };
            if (item.ItemSearchCategory === 45) {
              // It's a food
              foods.push(consumable);
            } else if (item.ItemSearchCategory === 43) {
              // It's a medicine
              medicines.push(consumable);
            }
          }
        });
        this.persistToJsonAsset('foods', foods);
        this.persistToJsonAsset('medicines', medicines);
        this.done();
      });
  }

  private computeBonuses(itemFood: any): any {
    /**
     *     "Bonuses": {
     *       "Strength": {
     *         "ID": 1,
     *         "Max": 12,
     *         "MaxHQ": 15,
     *         "Relative": true,
     *         "Value": 16,
     *         "ValueHQ": 20
     *       }
     *     }
     */
    const bonus: any = {};
    itemFood.Value.forEach((value, i) => {
      if (value === 0) {
        return;
      }
      const key = itemFood.BaseParam[i].Name.replace(/\s+/g, '');
      const bonusEntry: any = {
        ID: itemFood.BaseParam[i].index,
        Relative: itemFood.IsRelative[i],
        Value: value,
        ValueHQ: itemFood.ValueHQ[i]
      };

      if (bonusEntry.Relative) {
        bonusEntry.Max = itemFood.Max[i];
        bonusEntry.MaxHQ = itemFood.MaxHQ[i];
      }
      bonus[key] = bonusEntry;
    });
    return bonus;
  }

  getName(): string {
    return 'consumables';
  }

}
