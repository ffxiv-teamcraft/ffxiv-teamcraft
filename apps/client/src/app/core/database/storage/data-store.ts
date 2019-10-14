import { Observable } from 'rxjs';

export abstract class DataStore<T> {

  public abstract add(data: T, uriParams?: any): Observable<string>;

  public abstract get(uid: string, uriParams?: any): Observable<T>;

  public abstract update(uid: string, data: Partial<T>, uriParams?: any): Observable<void>;

  public abstract pureUpdate(uid: string, data: Partial<T>, uriParams?: any): Observable<void>;

  public abstract set(uid: string, data: T, uriParams?: any): Observable<void>;

  public abstract remove(uid: string, uriParams?: any): Observable<void>;

  protected abstract getBaseUri(params?: any): string;

  protected abstract getClass(): any;
}
