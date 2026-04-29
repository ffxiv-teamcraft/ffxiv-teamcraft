import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import { Action } from '@ngrx/store';

export const lazyLoaded = <T>(store: Store, actionFactory$: Observable<Action>) => (source: Observable<T>) => {
  return new Observable<T>((observer) => {
    const sub = actionFactory$.subscribe(action => store.dispatch(action));
    return source.subscribe({
      next(message) {
        observer.next(message);
      },
      error(err) {
        observer.error(err);
      },
      complete() {
        sub.unsubscribe();
        observer.complete();
      }
    });
  });
};
