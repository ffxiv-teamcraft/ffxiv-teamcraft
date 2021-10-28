import { AbstractExtractor } from './abstract-extractor';
import { Item } from '../../../../model/garland-tools/item';
import { ItemData } from '../../../../model/garland-tools/item-data';
import { DataType } from '../data-type';
import { GarlandToolsService } from '../../../../core/api/garland-tools.service';
import { uniq } from 'lodash';
import { combineLatest, Observable } from 'rxjs';
import { LazyDataFacade } from '../../../../lazy-data/+state/lazy-data.facade';
import { map } from 'rxjs/operators';

export class VenturesExtractor extends AbstractExtractor<number[]> {

  constructor(gt: GarlandToolsService, private lazyData: LazyDataFacade) {
    super(gt);
  }

  isAsync(): boolean {
    return true;
  }

  getDataType(): DataType {
    return DataType.VENTURES;
  }

  protected canExtract(item: Item): boolean {
    return true;
  }

  protected doExtract(item: Item, itemData: ItemData): Observable<number[]> {
    return combineLatest([
      this.lazyData.getEntry('retainerTasks'),
      this.lazyData.getRow('ventureSources', item.id, [])
    ]).pipe(
      map(([retainerTasks, ventures]) => {
        const deterministic = retainerTasks.filter(task => task.item === item.id).map(task => task.id);
        return uniq([...deterministic, ...ventures]);
      })
    );
  }

}
