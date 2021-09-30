import { AbstractExtractor } from './abstract-extractor';
import { CraftedBy } from '../../model/crafted-by';
import { ItemData } from '../../../../model/garland-tools/item-data';
import { DataType } from '../data-type';
import { GarlandToolsService } from '../../../../core/api/garland-tools.service';
import { Item } from '../../../../model/garland-tools/item';

export class CraftedByExtractor extends AbstractExtractor<CraftedBy[]> {

  constructor(protected gt: GarlandToolsService) {
    super(gt);
  }

  public isAsync(): boolean {
    return false;
  }

  public getDataType(): DataType {
    return DataType.CRAFTED_BY;
  }

  protected canExtract(item: Item): boolean {
    return item.isCraft() && !this.isCrystal(item.id);
  }

  protected doExtract(item: Item, itemData: ItemData): CraftedBy[] {
    const result = [];
    for (const craft of item.craft) {
      const craftedBy: CraftedBy = {
        itemId: item.id,
        icon: `./assets/icons/classjob/${this.gt.getJob(craft.job).name.toLowerCase()}.png`,
        job: craft.job,
        lvl: craft.lvl,
        stars_tooltip: craft.stars > 0 ? `(${craft.stars}★)` : '',
        id: craft.id,
        rlvl: craft.rlvl,
        durability: craft.durability,
        progression: craft.progress,
        quality: craft.quality,
        yield: craft.yield
      };
      if (craft.job === 0) {
        craftedBy.icon = '';
      }
      if (craft.unlockId !== undefined) {
        const masterbookPartial = itemData.getPartial(craft.unlockId.toString(), 'item');
        if (masterbookPartial !== undefined) {
          craftedBy.masterbook = {
            icon: masterbookPartial.obj.c,
            id: craft.unlockId
          };
        }
      }
      result.push(craftedBy);
    }
    return result;
  }

}
