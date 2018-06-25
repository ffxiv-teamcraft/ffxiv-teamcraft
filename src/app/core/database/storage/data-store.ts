import {Observable} from 'rxjs';

export abstract class DataStore<T> {

    protected abstract getBaseUri(params?: any): string;

    protected abstract getClass(): any;

    public abstract add(data: T, uriParams?: any): Observable<string>;

    public abstract get(uid: string, uriParams?: any): Observable<T>;

    public abstract update(uid: string, data: T, uriParams?: any): Observable<void>;

    public abstract set(uid: string, data: T, uriParams?: any): Observable<void>;

    public abstract remove(uid: string, uriParams?: any): Observable<void>;
}
