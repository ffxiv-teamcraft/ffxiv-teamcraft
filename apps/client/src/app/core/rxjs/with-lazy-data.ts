import { LazyDataFacade } from '../../lazy-data/+state/lazy-data.facade';
import { Observable, OperatorFunction } from 'rxjs';
import { LazyDataKey, LazyDataWithExtracts } from '../../lazy-data/lazy-data-types';
import { map, shareReplay, switchMap } from 'rxjs/operators';
import { safeCombineLatest } from './safe-combine-latest';

type TupleOf<T> = [T, ...T[]]

type MapTuple<T> =
// Extract the head and tail as seperate sections
  T extends [infer H, ...infer _T]
    // Compute the head and recurse into tail
    ? H extends keyof LazyDataWithExtracts
      ? [LazyDataWithExtracts[H], ...MapTuple<_T>]
      : never
    // base case, use a blank array so we don't consume our output into a never
    : []

export function withLazyData<T extends any, K extends TupleOf<LazyDataKey>>(lazyData: LazyDataFacade, ...entries: K): OperatorFunction<T, [T, ...MapTuple<K>]> {
  return (source: Observable<T>) => {
    return source.pipe(
      switchMap(data => {
        return safeCombineLatest(
          entries.map(entry => lazyData.getEntry(entry))
        ).pipe(
          map(entriesData => [data, ...entriesData] as [T, ...MapTuple<K>]),
          shareReplay({ bufferSize: 1, refCount: true })
        );
      })
    );
  };
}
