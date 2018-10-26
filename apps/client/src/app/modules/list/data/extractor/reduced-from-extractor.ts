import { AbstractExtractor } from './abstract-extractor';
import { ItemData } from '../../../../model/garland-tools/item-data';
import { DataType } from '../data-type';
import { Item } from '../../../../model/garland-tools/item';
import { GarlandToolsService } from '../../../../core/api/garland-tools.service';

export class ReducedFromExtractor extends AbstractExtractor<number[]> {

  constructor(gt: GarlandToolsService) {
    super(gt);
  }

  isAsync(): boolean {
    return false;
  }

  getDataType(): DataType {
    return DataType.REDUCED_FROM;
  }

  protected canExtract(item: Item): boolean {
    return item.reducedFrom !== undefined && item.reducedFrom.length > 0;
  }

  protected doExtract(item: Item, itemData: ItemData): any[] {
    return item.reducedFrom.map(reduction => itemData.getPartial(reduction.toString(), 'item'));
  }

}
