import { OperatorFunction } from 'rxjs';
import { map } from 'rxjs/operators';

export function toIndex<T extends Record<number | string, R>, R>(): OperatorFunction<T, Array<{ id: number, data: R }>> {
  return map((record) => {
      return Object.entries<R>(record).map(([key, value]) => ({ id: +key, data: value }));
    }
  );
}
