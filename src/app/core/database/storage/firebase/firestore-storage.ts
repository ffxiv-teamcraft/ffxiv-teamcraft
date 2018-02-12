import {DataModel} from '../data-model';
import {DataStore} from '../data-store';
import {Observable} from 'rxjs/Observable';
import {NgSerializerService} from '@kaiu/ng-serializer';
import {NgZone} from '@angular/core';
import {AngularFirestore} from 'angularfire2/firestore';
import * as firebase from 'firebase';
import {Action} from 'angularfire2/firestore/interfaces';
import DocumentReference = firebase.firestore.DocumentReference;
import DocumentSnapshot = firebase.firestore.DocumentSnapshot;

export abstract class FirestoreStorage<T extends DataModel> extends DataStore<T> {

    constructor(protected firestore: AngularFirestore, protected serializer: NgSerializerService, protected zone: NgZone) {
        super();
    }

    add(data: T): Observable<string> {
        return Observable.fromPromise(this.firestore.collection(this.getBaseUri()).add(JSON.parse(JSON.stringify(data))))
            .map((ref: DocumentReference) => {
                return ref.id;
            });
    }

    get(uid: string): Observable<T> {
        return this.firestore.collection(this.getBaseUri()).doc(uid).snapshotChanges()
            .map((snap: Action<DocumentSnapshot>) => {
                const valueWithKey: T = <T>{$key: snap.payload.id, ...snap.payload.data()};
                if (!snap.payload.exists) {
                    throw new Error('Not found');
                }
                delete snap.payload;
                return this.serializer.deserialize<T>(valueWithKey, this.getClass());
            })
            .debounceTime(50)
            .publishReplay(1)
            .refCount();
    }

    update(uid: string, data: T): Observable<void> {
        return this.zone.runOutsideAngular(() => {
            if (uid === undefined || uid === null || uid === '') {
                throw new Error('Empty uid');
            }
            return Observable.fromPromise(this.firestore.collection(this.getBaseUri()).doc(uid).update(JSON.parse(JSON.stringify(data))));
        });
    }

    set(uid: string, data: T): Observable<void> {
        return this.zone.runOutsideAngular(() => {
            if (uid === undefined || uid === null || uid === '') {
                throw new Error('Empty uid');
            }
            return Observable.fromPromise(this.firestore.collection(this.getBaseUri()).doc(uid).set(JSON.parse(JSON.stringify(data))));
        });
    }

    remove(uid: string): Observable<void> {
        if (uid === undefined || uid === null || uid === '') {
            throw new Error('Empty uid');
        }
        return Observable.fromPromise(this.firestore.collection(this.getBaseUri()).doc(uid).delete());
    }

}
