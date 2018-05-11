import {Observable} from 'rxjs';

export abstract class DataStore<T> {

    protected abstract getBaseUri(): string;

    protected abstract getClass(): any;

    public abstract add(data: T): Observable<string>;

    public abstract get(uid: string): Observable<T>;

    public abstract update(uid: string, data: T): Observable<void>;

    public abstract set(uid: string, data: T): Observable<void>;

    public abstract remove(uid: string): Observable<void>;
}
