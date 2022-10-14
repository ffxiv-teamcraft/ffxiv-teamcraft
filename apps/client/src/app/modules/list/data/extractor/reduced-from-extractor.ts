import { AbstractExtractor } from './abstract-extractor';
import { DataType } from '../data-type';
import { LazyDataFacade } from '../../../../lazy-data/+state/lazy-data.facade';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { safeCombineLatest } from '../../../../core/rxjs/safe-combine-latest';

export class ReducedFromExtractor extends AbstractExtractor<number[]> {

  constructor(private lazyData: LazyDataFacade) {
    super();
  }

  isAsync(): boolean {
    return true;
  }

  getDataType(): DataType {
    return DataType.REDUCED_FROM;
  }

  protected doExtract(itemId: number): Observable<number[]> {
    return this.lazyData.getRow('reduction', itemId, []).pipe(
      switchMap(reduce => {
        if (!reduce) {
          return [];
        }
        return safeCombineLatest(reduce.map(id => {
          return this.lazyData.getRow('aetherialReduce', id, 0).pipe(
            map(res => res > 0 ? id : -1)
          );
        })).pipe(
          map(resArray => resArray.filter(r => r > 0))
        );
      })
    );
  }

}
