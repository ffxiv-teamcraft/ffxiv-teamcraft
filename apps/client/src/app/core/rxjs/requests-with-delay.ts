import { BehaviorSubject, Observable, of } from 'rxjs';
import { bufferCount, delay, mergeMap, tap } from 'rxjs/operators';

export function requestsWithDelay<T>(requests: Observable<T>[], _delay: number, emit: true): Observable<T>
export function requestsWithDelay<T>(requests: Observable<T>[], _delay: number, emit ?: false): Observable<T[]>
export function requestsWithDelay<T>(requests: Observable<T>[], _delay: number, emit = false): Observable<T | T[]> {
  if (requests.length === 0) {
    return of([]);
  }
  const index$ = new BehaviorSubject(0);
  const pipeline = index$.pipe(
    delay(_delay),
    mergeMap(index => {
      return requests[index].pipe(
        tap(() => {
          if (requests[index + 1] !== undefined) {
            index$.next(index + 1);
          }
        })
      );
    })
  );
  return emit ? pipeline : pipeline.pipe(bufferCount(requests.length));
}
