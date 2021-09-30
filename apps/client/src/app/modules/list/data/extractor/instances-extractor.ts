import { AbstractExtractor } from './abstract-extractor';
import { ItemData } from '../../../../model/garland-tools/item-data';
import { DataType } from '../data-type';
import { Item } from '../../../../model/garland-tools/item';
import { GarlandToolsService } from '../../../../core/api/garland-tools.service';
import { LazyDataService } from '../../../../core/data/lazy-data.service';

export class InstancesExtractor extends AbstractExtractor<number[]> {

  constructor(gt: GarlandToolsService, private lazyData: LazyDataService) {
    super(gt);
  }

  isAsync(): boolean {
    return false;
  }

  getDataType(): DataType {
    return DataType.INSTANCES;
  }

  protected canExtract(item: Item): boolean {
    return item.instances !== undefined;
  }

  protected doExtract(item: Item, itemData: ItemData): number[] {
    return this.lazyData.data.instanceSources[item.id] || [];
  }

}
