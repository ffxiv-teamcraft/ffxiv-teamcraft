import { AbstractExtractor } from './abstract-extractor';
import { ItemData } from '../../../../model/garland-tools/item-data';
import { DataType } from '../data-type';
import { Item } from '../../../../model/garland-tools/item';
import { GarlandToolsService } from '../../../../core/api/garland-tools.service';

export class GardeningExtractor extends AbstractExtractor<number> {

  constructor(gt: GarlandToolsService) {
    super(gt);
  }

  isAsync(): boolean {
    return false;
  }

  getDataType(): DataType {
    return DataType.GARDENING;
  }

  extractsArray(): boolean {
    return false;
  }

  protected canExtract(item: Item): boolean {
    return item.seeds !== undefined;
  }

  protected doExtract(item: Item, itemData: ItemData): number {
    return item.seeds[0];
  }

}
