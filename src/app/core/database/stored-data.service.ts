import {Observable} from 'rxjs/Observable';
import {NgSerializerService} from '@kaiu/ng-serializer';
import {FirebaseDataModel} from '../../model/list/firebase-data-model';
import * as firebase from 'firebase/app';
import {AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument} from 'angularfire2/firestore';
import {DocumentChangeAction} from 'angularfire2/firestore/interfaces';
import 'rxjs/add/observable/fromPromise';

export abstract class StoredDataService<T extends FirebaseDataModel> {

    constructor(protected afdb: AngularFirestore, protected serializer: NgSerializerService) {
    }

    protected abstract getBaseUri(params?: any): Observable<string>;

    protected abstract getClass(): any;

    /**
     * Gets one object from database as T instance
     *
     * @param uid
     * @param params
     * @returns {Observable<R>}
     */
    public get(uid: string, params?: any): Observable<T> {
        return this.getBaseUri(params).switchMap(uri => {
            return this.oneRef(uri, uid)
                .snapshotChanges()
                .map(snap => {
                    const obj = snap.payload.data();
                    const res: T = this.serializer.deserialize<T>(obj, this.getClass());
                    res.$key = snap.payload.id;
                    return res;
                });
        });
    }

    /**
     * Gets the list-details of items in this base uri.
     *
     * @returns {Observable<R>}
     */
    public getAll(params?: any): Observable<T[]> {
        return this.getBaseUri(params).switchMap(uri => {
            return this.listRef(uri)
                .snapshotChanges()
                .map((snap: DocumentChangeAction[]) => {
                    const obj = snap.map(snapRow => snapRow.payload.doc.data());
                    const res: T[] = this.serializer.deserialize<T>(obj, [this.getClass()]);
                    res.forEach((row, index) => {
                        row.$key = snap[index].payload.doc.id;
                    });
                    return res;
                });
        });
    }

    /**
     * Pushes an item in the database list-details.
     *
     * @param item
     * @param params
     * @returns {firebase.database.ThenableReference}
     */
    public push(item: T, params?: any): Promise<string> {
        return new Promise<any>(resolve => {
            return this.getBaseUri(params).subscribe(uri => {
                return this.listRef(`${uri}`).add(<T>item.getData()).then(ref => resolve(ref.id));
            });
        });
    }

    /**
     * Updates an item with the given uid.
     *
     * @param uid
     * @param value
     * @param params
     * @returns {firebase.Promise<void>}
     */
    public update(uid: string, value: T, params?: any): Promise<void> {
        return new Promise<void>(resolve => {
            return this.getBaseUri(params).switchMap(uri => {
                delete value.$key;
                return Observable.fromPromise(this.oneRef(uri, uid).set(<T>value.getData()));
            }).subscribe(resolve);
        });
    }

    /**
     * removes the given item in the current reference.
     *
     * @param uid
     * @param params
     * @returns {firebase.Promise<void>}
     */
    public remove(uid: string, params?: any): Promise<void> {
        return new Promise<void>(resolve => {
            return this.getBaseUri(params).subscribe(uri => {
                return this.oneRef(uri, uid).delete().then(resolve);
            });
        });
    }

    private listRef(uri: string): AngularFirestoreCollection<T> {
        return this.afdb.collection<T>(uri);
    }

    private oneRef(uri: string, uid: string): AngularFirestoreDocument<T> {
        return this.afdb.doc<T>(`${uri}/${uid}`);
    }
}
