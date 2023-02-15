import { LazyDataFacade } from '../../lazy-data/+state/lazy-data.facade';
import { Observable, OperatorFunction } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { LazyDataEntries, LazyDataRecordKey } from '@ffxiv-teamcraft/types';


export function withLazyRow<T, K extends LazyDataRecordKey>(lazyData: LazyDataFacade, entry: K, idMappingFuntion: (data: T) => number): OperatorFunction<T, [T, LazyDataEntries[K]]> {
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
