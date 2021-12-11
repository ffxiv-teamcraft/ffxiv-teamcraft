import { AbstractExtractor } from './abstract-extractor';
import { DataType } from '../data-type';
import { uniq } from 'lodash';
import { combineLatest, Observable } from 'rxjs';
import { LazyDataFacade } from '../../../../lazy-data/+state/lazy-data.facade';
import { map } from 'rxjs/operators';
import { LazyRetainerTask } from '../../../../lazy-data/model/lazy-retainer-task';

export class VenturesExtractor extends AbstractExtractor<LazyRetainerTask[]> {

  constructor(private lazyData: LazyDataFacade) {
    super();
  }

  isAsync(): boolean {
    return true;
  }

  getDataType(): DataType {
    return DataType.VENTURES;
  }

  protected doExtract(itemId: number): Observable<LazyRetainerTask[]> {
    return combineLatest([
      this.lazyData.getEntry('retainerTasks'),
      this.lazyData.getRow('ventureSources', itemId, [])
    ]).pipe(
      map(([retainerTasks, ventures]) => {
        const deterministic = retainerTasks.filter(task => task.item === itemId).map(task => task.id);
        const resultVentures = uniq([...deterministic, ...ventures]);
        return resultVentures.map(id => {
          return retainerTasks.find(t => t.id === id);
        });
      })
    );
  }

}
