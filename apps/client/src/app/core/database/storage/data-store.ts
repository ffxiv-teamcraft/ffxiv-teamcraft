import { Observable } from 'rxjs';
import { UpdateData } from '@angular/fire/firestore';

export abstract class DataStore<T> {

  public abstract add(data: T): Observable<string>;

  public abstract get(uid: string): Observable<T>;

  public abstract update(uid: string, data: UpdateData<T>): Observable<void>;

  public abstract pureUpdate(uid: string, data: UpdateData<T>): Observable<void>;

  public abstract set(uid: string, data: T): Observable<void>;

  public abstract remove(uid: string): Observable<void>;

  protected abstract getBaseUri(): string;

  protected abstract getClass(): any;
}
