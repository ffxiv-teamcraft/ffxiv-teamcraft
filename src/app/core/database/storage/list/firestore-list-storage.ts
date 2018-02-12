import {List} from '../../../../model/list/list';
import {Injectable, NgZone} from '@angular/core';
import {ListStore} from './list-store';
import {Observable} from 'rxjs/Observable';
import {NgSerializerService} from '@kaiu/ng-serializer';
import {FirestoreStorage} from '../firebase/firestore-storage';
import {AngularFirestore} from 'angularfire2/firestore';

@Injectable()
export class FirestoreListStorage extends FirestoreStorage<List> implements ListStore {

    constructor(protected firestore: AngularFirestore, protected serializer: NgSerializerService, protected zone: NgZone) {
        super(firestore, serializer, zone);
    }

    getPublicLists(): Observable<List[]> {
        return this.firestore.collection(this.getBaseUri(), ref => ref.where('public', '==', true))
            .snapshotChanges()
            .map(snaps => snaps.map(snap => ({$key: snap.payload.doc.id, ...snap.payload.doc.data()})))
            .map(lists => this.serializer.deserialize<List>(lists, [List]))
            .map(lists => lists.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }

    byAuthor(uid: string): Observable<List[]> {
        return this.listsByAuthorRef(uid);
    }

    deleteByAuthor(uid: string): Observable<void> {
        return this.listsByAuthorRef(uid)
            .first()
            .map(lists => lists.map(list => list.$key))
            .switchMap(listIds => {
                const deletion = listIds.map(id => {
                    return Observable.fromPromise(this.firestore.collection(this.getBaseUri()).doc(id).delete());
                });
                return Observable.combineLatest(deletion, () => {
                });
            });
    }

    private listsByAuthorRef(uid: string): Observable<List[]> {
        return this.firestore
            .collection(this.getBaseUri(), ref => ref.where('authorId', '==', uid).orderBy('createdAt'))
            .snapshotChanges()
            .map(snaps => snaps.map(snap => (<List>{$key: snap.payload.doc.id, ...snap.payload.doc.data()})))
            .map(lists => this.serializer.deserialize<List>(lists, [List]))
            .publishReplay(1)
            .refCount();
    }

    protected getBaseUri(): string {
        return 'lists';
    }

    protected getClass(): any {
        return List;
    }
}
