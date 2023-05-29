import { Database, objectVal, ref } from '@angular/fire/database';
import { Observable, of } from 'rxjs';
import { first, tap } from 'rxjs/operators';

export function cachedFirebaseValue<T = any>(firebase: Database, path: string, TTLms: number): Observable<T> {
  const lsKey = `rtdb:${path}`;
  const currentLsValue = localStorage.getItem(lsKey);
  const parsedLsValue = currentLsValue ? JSON.parse(currentLsValue) : { value: null, updated: 0 };
  if (parsedLsValue.updated + TTLms < Date.now()) {
    return objectVal<T>(ref(firebase, path)).pipe(
      first(),
      tap(value => {
        localStorage.setItem(lsKey, JSON.stringify({ value, updated: Date.now() }));
      })
    );
  }
  return of(parsedLsValue.value);
}
