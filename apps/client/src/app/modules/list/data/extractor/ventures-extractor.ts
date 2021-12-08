import { AbstractExtractor } from './abstract-extractor';
import { DataType } from '../data-type';
import { uniq } from 'lodash';
import { combineLatest, Observable } from 'rxjs';
import { LazyDataFacade } from '../../../../lazy-data/+state/lazy-data.facade';
import { map } from 'rxjs/operators';

export class VenturesExtractor extends AbstractExtractor<number[]> {

  constructor(private lazyData: LazyDataFacade) {
    super();
  }

  isAsync(): boolean {
    return true;
  }

  getDataType(): DataType {
    return DataType.VENTURES;
  }

  protected doExtract(itemId: number): Observable<number[]> {
    return combineLatest([
      this.lazyData.getEntry('retainerTasks'),
      this.lazyData.getRow('ventureSources', itemId, [])
    ]).pipe(
      map(([retainerTasks, ventures]) => {
        const deterministic = retainerTasks.filter(task => task.item === itemId).map(task => task.id);
        return uniq([...deterministic, ...ventures]);
      })
    );
  }

}
