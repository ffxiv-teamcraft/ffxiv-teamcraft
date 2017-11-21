import {Observable} from 'rxjs/Observable';

export interface DataStore<T> {

    add(data: T): Observable<string>;

    get(uid: string): Observable<T>;

    update(uid: string, data: T): Observable<void>;

    remove(uid: string): Observable<void>;
}
