import { AbstractExtractor } from './abstract-extractor';
import { Item } from '../../../../model/garland-tools/item';
import { ItemData } from '../../../../model/garland-tools/item-data';
import { Observable } from 'rxjs';
import { DataType } from '../data-type';
import { GarlandToolsService } from '../../../../core/api/garland-tools.service';
import { LazyDataService } from '../../../../core/data/lazy-data.service';

export class VenturesExtractor extends AbstractExtractor<number[]> {

  constructor(gt: GarlandToolsService, private lazyData: LazyDataService) {
    super(gt);
  }

  isAsync(): boolean {
    return false;
  }

  getDataType(): DataType {
    return DataType.VENTURES;
  }

  protected canExtract(item: Item): boolean {
    return item.ventures !== undefined && item.ventures.length > 0;
  }

  protected doExtract(item: Item, itemData: ItemData): Observable<number[]> | number[] {
    return this.lazyData.data.ventureSources[item.id];
  }

}
