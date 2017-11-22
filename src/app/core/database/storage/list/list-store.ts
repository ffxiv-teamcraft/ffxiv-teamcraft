import {DataStore} from '../data-store';
import {List} from '../../../../model/list/list';
import {Observable} from 'rxjs/Observable';
import {InjectionToken} from '@angular/core';

export const LIST_STORE = new InjectionToken('list store');

export interface ListStore extends DataStore<List> {

    byAuthor(uid: string): Observable<List[]>;

    deleteByAuthor(uid: string): Observable<void[]>;
}
