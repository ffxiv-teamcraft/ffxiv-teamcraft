import { LazyDataFacade } from '../../lazy-data/+state/lazy-data.facade';
import { Observable, OperatorFunction } from 'rxjs';
import { LazyDataEntries, LazyDataRecordKey } from '../../lazy-data/lazy-data-types';
import { map, switchMap } from 'rxjs/operators';


export function withLazyRow<T extends any, K extends LazyDataRecordKey>(lazyData: LazyDataFacade, entry: K, idMappingFuntion: (data: T) => number): OperatorFunction<T, [T, LazyDataEntries[K]]> {
  return (source: Observable<T>) => {
    return source.pipe(
      switchMap(data => {
        return lazyData.getRow(entry, idMappingFuntion(data)).pipe(
          map(row => [data, row] as [T, LazyDataEntries[K]])
        );
      })
    );
  };
}
