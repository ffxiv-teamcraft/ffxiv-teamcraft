import { AbstractExtractor } from './abstract-extractor';
import { ItemData } from '../../../../model/garland-tools/item-data';
import { DataType } from '../data-type';
import { Item } from '../../../../model/garland-tools/item';
import { GarlandToolsService } from '../../../../core/api/garland-tools.service';
import { LazyDataFacade } from 'apps/client/src/app/lazy-data/+state/lazy-data.facade';
import { Observable } from 'rxjs';

export class DesynthsExtractor extends AbstractExtractor<number[]> {

  constructor(gt: GarlandToolsService, private lazyData: LazyDataFacade) {
    super(gt);
  }

  isAsync(): boolean {
    return true;
  }

  getDataType(): DataType {
    return DataType.DESYNTHS;
  }

  protected canExtract(item: Item): boolean {
    return true;
  }

  protected doExtract(item: Item, itemData: ItemData): Observable<number[]> {
    return this.lazyData.getRow('desynth', item.id);
  }

}
