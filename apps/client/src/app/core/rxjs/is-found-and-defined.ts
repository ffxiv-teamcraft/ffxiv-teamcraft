import { Observable, OperatorFunction } from 'rxjs';
import { filter } from 'rxjs/operators';
import { DataModel } from '../database/storage/data-model';

export function isFoundAndDefined<T extends DataModel>(...extraProps: Array<keyof T>): OperatorFunction<T, T> {
  return (source: Observable<T>) => {
    return source.pipe(
      filter((data) => {
        return !data?.notFound && extraProps.every(prop => data[prop] !== undefined);
      })
    );
  };
}
