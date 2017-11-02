import {AngularFireAction, AngularFireDatabase, AngularFireList, AngularFireObject} from 'angularfire2/database';
import {Observable} from 'rxjs/Observable';
import {NgSerializerService} from '@kaiu/ng-serializer';
import {FirebaseDataModel} from '../../model/list/firebase-data-model';
import * as firebase from 'firebase/app';
import DataSnapshot = firebase.database.DataSnapshot;

export abstract class StoredDataService<T extends FirebaseDataModel> {

    constructor(protected afdb: AngularFireDatabase, protected serializer: NgSerializerService) {
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
            return this.oneRef(uri, uid).snapshotChanges()
                .map(snap => {
                    const obj = snap.payload.val();
                    const res: T = this.serializer.deserialize<T>(obj, this.getClass());
                    res.$key = snap.payload.key;
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
                .map((snap: AngularFireAction<DataSnapshot>[]) => {
                    const obj = snap.map(snapRow => snapRow.payload.val());
                    const res: T[] = this.serializer.deserialize<T>(obj, [this.getClass()]);
                    res.forEach((row, index) => {
                        row.$key = snap[index].payload.key;
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
    public push(item: T, params?: any): Promise<any> {
        return new Promise<any>(resolve => {
            return this.getBaseUri(params).subscribe(uri => {
                return this.listRef(`${uri}`).push(item).then(resolve);
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
                return Observable.fromPromise(this.oneRef(uri, uid).update(value));
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
                return this.oneRef(uri, uid).remove().then(resolve);
            });
        });
    }

    private listRef(uri: string): AngularFireList<T> {
        return this.afdb.list(uri);
    }

    private oneRef(uri: string, uid: string): AngularFireObject<T> {
        return this.afdb.object(`${uri}/${uid}`);
    }
}
