import { BehaviorSubject, Observable, of } from 'rxjs';
import { bufferCount, delay, map, mergeMap, tap } from 'rxjs/operators';

export function requestsWithDelay(requests: Observable<any>[], _delay: number, emit = false): Observable<any[]> {
  if (requests.length === 0) {
    return of([]);
  }
  const index$ = new BehaviorSubject(0);
  return index$.pipe(
    delay(_delay),
    mergeMap(index => {
      return requests[index].pipe(
        tap(() => {
          if (requests[index + 1] !== undefined) {
            index$.next(index + 1);
          }
        })
      );
    }),
    emit ? map(a => [a]) : bufferCount(requests.length)
  );
}
