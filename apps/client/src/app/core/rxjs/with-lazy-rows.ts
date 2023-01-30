import { LazyDataFacade } from '../../lazy-data/+state/lazy-data.facade';
import { Observable, OperatorFunction } from 'rxjs';
import { LazyDataEntries, LazyDataRecordKey } from '../../lazy-data/lazy-data-types';
import { map, switchMap } from 'rxjs/operators';
import { safeCombineLatest } from './safe-combine-latest';


export function withLazyRows<T extends Array<any>, K extends LazyDataRecordKey>(lazyData: LazyDataFacade, entry: K, idMappingFunction: (row: T[0]) => number): OperatorFunction<T, [T, LazyDataEntries[K][]]> {
  return (source: Observable<T>) => {
    return source.pipe(
      switchMap(data => {
        return safeCombineLatest(data.map(row => {
          return lazyData.getRow(entry, idMappingFunction(row));
        })).pipe(
          map(lazyRows => [data, lazyRows] as [T, LazyDataEntries[K][]])
        );
      })
    );
  };
}
