import { Observable, OperatorFunction } from 'rxjs';
import { filter, mergeMap, tap } from 'rxjs/operators';

export function uniqMergeMap<T, R>(project: (data: T) => any, observableFactory: (data: T) => Observable<R>, concurrency = 1): OperatorFunction<T, R> {
  return (source: Observable<T>) => {
    const seen = new Set<any>();
    return source.pipe(
      filter(value => !seen.has(project(value))),
      tap(value => seen.add(value)),
      mergeMap(value => observableFactory(value), concurrency)
    );
  };
}
