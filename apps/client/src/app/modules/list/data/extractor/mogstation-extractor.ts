import { AbstractExtractor } from './abstract-extractor';
import { Item } from '../../../../model/garland-tools/item';
import { DataType } from '../data-type';
import { GarlandToolsService } from '../../../../core/api/garland-tools.service';
import { LazyDataService } from '../../../../core/data/lazy-data.service';
import { MogstationItem } from '../../model/mogstation-item';

export class MogstationExtractor extends AbstractExtractor<MogstationItem> {
  constructor(gt: GarlandToolsService, private lazyData: LazyDataService) {
    super(gt);
  }

  getDataType(): DataType {
    return DataType.MOGSTATION;
  }

  isAsync(): boolean {
    return false;
  }

  protected canExtract(item: Item): boolean {
    return this.lazyData.data.mogstationSources[item.id] !== undefined;
  }

  protected doExtract(item: Item): MogstationItem {
    return this.lazyData.data.mogstationSources[item.id];
  }

}
