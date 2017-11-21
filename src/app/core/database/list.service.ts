import {List} from '../../model/list/list';
import {Injectable} from '@angular/core';
import {NgSerializerService} from '@kaiu/ng-serializer';
import {Observable} from 'rxjs/Observable';
import {AngularFirestore} from 'angularfire2/firestore';
import {DocumentChangeAction} from 'angularfire2/firestore/interfaces';
import {FirestoreListStorage} from 'app/core/database/storage/firestore/firestore-list-storage';

@Injectable()
export class ListService extends FirestoreListStorage {

    constructor(protected firestore: AngularFirestore,
                protected serializer: NgSerializerService) {
        super(firestore, serializer);
    }

    /**
     * Gets the router path for a given list-details (useful to share lists)
     * @param uid The uid of the list-details
     * @returns {Observable<R>}
     */
    public getRouterPath(uid: string): Observable<string[]> {
        return Observable.of(['list', uid]);
    }

    /**
     * Returns all the lists created by a given user based on his id.
     * @param {string} userId
     * @returns {Observable<List[]>}
     */
    public getUserLists(userId: string): Observable<List[]> {
        return this.firestore
            .collection('lists', ref => ref.where('authorId', '==', userId))
            .snapshotChanges()
            .map((snap: DocumentChangeAction[]) => {
                const obj = snap.map(snapRow => snapRow.payload.doc.data());
                const res: List[] = this.serializer.deserialize<List>(obj, [this.getClass()]);
                res.forEach((row, index) => {
                    row.$key = snap[index].payload.doc.id;
                });
                return res;
            });
    }

    /**
     * Delete all lists of a given user.
     * @param {string} uid
     * @returns {Promise<void>}
     */
    public deleteUserLists(uid: string): Observable<void[]> {
        return this.firestore
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

    add(list: List, params?: any): Observable<string> {
        if (list.authorId === undefined) {
            throw new Error('Tried to persist a list with no author ID');
        }
        return super.add(list, params);
    }
}
