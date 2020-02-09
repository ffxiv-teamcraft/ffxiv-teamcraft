import { Observable, OperatorFunction } from 'rxjs';
import { filter, map, withLatestFrom } from 'rxjs/operators';
import { DataModel } from '../database/storage/data-model';

export function onlyIfNotConnected<T>(
  listSource$: Observable<DataModel[]>,
  keyGetter: (input: T) => string
): OperatorFunction<T, T> {
  return (source: Observable<T>) => {
    return source.pipe(
      withLatestFrom(listSource$),
      filter(([action, list]) => {
        return !list.some(row => row.$key === keyGetter(action));
      }),
      map(([action]) => action)
    );
  };
}
