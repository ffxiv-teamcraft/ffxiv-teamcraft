import { AbstractExtractor } from './abstract-extractor';
import { GarlandToolsService } from '../../../../core/api/garland-tools.service';
import { DataType } from '../data-type';
import { Item } from '../../../../model/garland-tools/item';
import { Treasure } from '../../model/treasure';
import { ItemData } from '../../../../model/garland-tools/item-data';

export class TreasuresExtractor extends AbstractExtractor<Treasure[]> {
  constructor(gt: GarlandToolsService) {
    super(gt);
  }

  getDataType(): DataType {
    return DataType.TREASURES;
  }

  isAsync(): boolean {
    return false;
  }

  protected canExtract(item: Item): boolean {
    return item.treasure !== undefined;
  }

  protected doExtract(item: Item, itemData: ItemData): Treasure[] {
    return item.treasure.map(t => {
      const partial = itemData.getPartial(t.toString(), 'item');
      return {
        itemId: t,
        icon: partial.obj.c
      };
    });
  }
}
