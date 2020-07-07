import { AbstractExtractor } from './abstract-extractor';
import { ItemData } from '../../../../model/garland-tools/item-data';
import { DataType } from '../data-type';
import { Item } from '../../../../model/garland-tools/item';
import { GarlandToolsService } from '../../../../core/api/garland-tools.service';
import { LazyDataService } from '../../../../core/data/lazy-data.service';
import { uniq } from 'lodash';

export class DesynthsExtractor extends AbstractExtractor<number[]> {

  constructor(gt: GarlandToolsService, private lazyData: LazyDataService) {
    super(gt);
  }

  isAsync(): boolean {
    return false;
  }

  getDataType(): DataType {
    return DataType.DESYNTHS;
  }

  protected canExtract(item: Item): boolean {
    return (item.desynthedFrom !== undefined && item.desynthedFrom.length > 0) || this.lazyData.data.desynth[item.id] !== undefined;
  }

  protected doExtract(item: Item, itemData: ItemData): number[] {
    return uniq([...(item.desynthedFrom || []), ...(this.lazyData.data.desynth[item.id] || [])]);
  }

}
