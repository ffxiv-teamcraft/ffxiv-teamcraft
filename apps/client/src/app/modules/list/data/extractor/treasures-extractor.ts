import { AbstractExtractor } from './abstract-extractor';
import { GarlandToolsService } from '../../../../core/api/garland-tools.service';
import { DataType } from '../data-type';
import { Item } from '../../../../model/garland-tools/item';
import { ItemData } from '../../../../model/garland-tools/item-data';
import { LazyDataFacade } from '../../../../lazy-data/+state/lazy-data.facade';
import { Observable } from 'rxjs';

export class TreasuresExtractor extends AbstractExtractor<number[]> {
  constructor(gt: GarlandToolsService, private lazyData: LazyDataFacade) {
    super(gt);
  }

  getDataType(): DataType {
    return DataType.TREASURES;
  }

  isAsync(): boolean {
    return true;
  }

  protected canExtract(item: Item): boolean {
    return true;
  }

  protected doExtract(item: Item, itemData: ItemData): Observable<number[]> {
    return this.lazyData.getRow('lootSources', item.id);
  }
}
