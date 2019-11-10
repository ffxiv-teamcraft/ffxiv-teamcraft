import { BehaviorSubject, Observable } from 'rxjs';
import { bufferCount, delay, mergeMap, tap, map } from 'rxjs/operators';

export function requestsWithDelay(requests: Observable<any>[], _delay: number, emit = false): Observable<any[]> {
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
