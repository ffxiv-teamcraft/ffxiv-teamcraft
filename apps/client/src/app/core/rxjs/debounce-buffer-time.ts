import { Observable, OperatorFunction } from 'rxjs';
import { buffer, debounceTime } from 'rxjs/operators';

export function debounceBufferTime<T>(
  duration: number
): OperatorFunction<T, T[]> {
  return (source: Observable<T>) => {
    return source.pipe(
      buffer(source.pipe(debounceTime(duration)))
    );
  };
}
