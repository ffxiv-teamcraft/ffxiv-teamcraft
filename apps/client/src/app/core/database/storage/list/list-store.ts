import { DataStore } from '../data-store';
import { List } from '../../../../modules/list/model/list';
import { Observable } from 'rxjs';

export abstract class ListStore extends DataStore<List> {

  public abstract getPublicLists(): Observable<List[]>;

  public abstract byAuthor(uid: string): Observable<List[]>;

  public abstract deleteByAuthor(uid: string): Observable<void>;

  public abstract getPublicListsByAuthor(uid: string): Observable<List[]>;
}
