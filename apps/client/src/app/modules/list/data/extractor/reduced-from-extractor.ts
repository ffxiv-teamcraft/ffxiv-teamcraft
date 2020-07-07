import { AbstractExtractor } from './abstract-extractor';
import { ItemData } from '../../../../model/garland-tools/item-data';
import { DataType } from '../data-type';
import { Item } from '../../../../model/garland-tools/item';
import { GarlandToolsService } from '../../../../core/api/garland-tools.service';
import { LazyDataService } from '../../../../core/data/lazy-data.service';
import { uniq } from 'lodash';

export class ReducedFromExtractor extends AbstractExtractor<number[]> {

  constructor(gt: GarlandToolsService, private lazyData: LazyDataService) {
    super(gt);
  }

  isAsync(): boolean {
    return false;
  }

  getDataType(): DataType {
    return DataType.REDUCED_FROM;
  }

  protected canExtract(item: Item): boolean {
    return (item.reducedFrom !== undefined && item.reducedFrom.length > 0) || this.lazyData.data.reduction[item.id] !== undefined;
  }

  protected doExtract(item: Item, itemData: ItemData): any[] {
    return uniq([...(item.reducedFrom || []), ...(this.lazyData.data.reduction[item.id] || [])]);
  }

}
