import {List} from '../../../../model/list/list';
import {Observable} from 'rxjs/Observable';
import {AngularFirestore} from 'angularfire2/firestore';
import {NgSerializerService} from '@kaiu/ng-serializer';
import {Injectable} from '@angular/core';
import {FirestoreStorage} from '../firestore/firestore-storage';
import {ListStore} from './list-store';
import {DocumentChangeAction} from 'angularfire2/firestore/interfaces';

@Injectable()
/**
 * @deprecated Not finished, don't use for production
 */
export class FirestoreListStorage extends FirestoreStorage<List> implements ListStore {

    constructor(firestore: AngularFirestore, serializer: NgSerializerService) {
        super(firestore, serializer);
    }

    deleteByAuthor(uid: string): Observable<void[]> {
        return this.afdb
            .collection('lists', ref => ref.where('authorId', '==', uid))
            .snapshotChanges()
            .switchMap((snap: DocumentChangeAction[]) => {
                const batch: Observable<void>[] = [];
                snap.forEach(row => {
                    batch.push(this.remove(row.payload.doc.id));
                });
                return Observable.combineLatest(batch);
            });
    }

    byAuthor(uid: string): Observable<List[]> {
        return this.getAll(ref => ref.where('authorId', '==', uid));
    }

    getBaseUri(params?: any): Observable<string> {
        return Observable.of('lists');
    }

    getClass(): any {
        return List;
    }
}
