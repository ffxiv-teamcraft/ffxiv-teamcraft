import { AbstractExtractor } from './abstract-extractor';
import { GarlandToolsService } from '../../../../core/api/garland-tools.service';
import { DataType } from '../data-type';
import { Item } from '../../../../model/garland-tools/item';
import { ItemData } from '../../../../model/garland-tools/item-data';
import { LazyDataService } from '../../../../core/data/lazy-data.service';

export class TreasuresExtractor extends AbstractExtractor<number[]> {
  constructor(gt: GarlandToolsService, private lazyData: LazyDataService) {
    super(gt);
  }

  getDataType(): DataType {
    return DataType.TREASURES;
  }

  isAsync(): boolean {
    return false;
  }

  protected canExtract(item: Item): boolean {
    return true;
  }

  protected doExtract(item: Item, itemData: ItemData): number[] {
    return this.lazyData.data.lootSources[item.id];
  }
}
