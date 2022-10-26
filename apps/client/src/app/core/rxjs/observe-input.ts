//Source: https://github.com/rudini/observable-from-input/blob/master/src/index.ts
import { Observable, ReplaySubject } from 'rxjs';

export function observeInput<T, K extends keyof T>(target: T, name: K, optional?: false): Observable<T[K]>;
export function observeInput<T, K extends keyof T>(target: T, name: K, optional: true): Observable<T[K] | null>;
export function observeInput<T, K extends keyof T>(target: T, name: K, optional = false): Observable<T[K]> | Observable<T[K] | null> {
  let current: T[K];
  const subject = new ReplaySubject<T[K]>(1);

  if (target[name] !== undefined || optional) {
    subject.next((target[name] || null) as T[K] | null);
  }

  if (Reflect.getMetadata('Observer', target, name.toString())) {
    console.error(`Trying to setup an input Observer on an input that's already observed, input name: ${name.toString()}`);
  }

  Reflect.defineMetadata('Observer', true, target, name.toString());

  Object.defineProperty(target, name, {
    set(value: T[K]) {
      subject.next(value);
      current = value;
    },
    get() {
      return current;
    }
  });

  return subject.asObservable();
}
