import {AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable} from 'angularfire2/database';
import {Observable} from 'rxjs/Observable';
import {NgSerializerService} from '@kaiu/ng-serializer/ng-serializer.service';
import * as firebase from 'firebase/app';
import {FirebaseDataModel} from '../../model/list/firebase-data-model';
import ThenableReference = firebase.database.ThenableReference;
import Promise = firebase.Promise;

export abstract class StoredDataService<T extends FirebaseDataModel> {

    constructor(protected firebase: AngularFireDatabase, protected serializer: NgSerializerService) {
    }

    protected abstract getBaseUri(): Observable<string>;

    protected abstract getClass(): any;

    /**
     * Gets one object from database as T instance
     *
     * @param uid
     * @returns {Observable<R>}
     */
    public get(uid: string): Observable<T> {
        return this.getBaseUri().mergeMap(uri => {
            return this.oneRef(uri, uid).map(obj => {
                const res: T = this.serializer.deserialize<T>(obj, this.getClass());
                res.$key = obj.$key;
                return res;
            });
        });
    }

    /**
     * Gets the list-details of items in this base uri.
     *
     * @returns {Observable<R>}
     */
    public getAll(): Observable<T[]> {
        return this.getBaseUri().mergeMap(uri => {
            return this.listRef(uri).map(obj => {
                const res: T[] = this.serializer.deserialize<T>(obj, [this.getClass()]);
                res.forEach((row, index) => {
                    row.$key = obj[index].$key;
                });
                return res;
            });
        });
    }

    /**
     * Pushes an item in the database list-details.
     *
     * @param item
     * @returns {firebase.database.ThenableReference}
     */
    public push(item: T): Promise<any> {
        return new Promise<any>(resolve => {
            return this.getBaseUri().subscribe(uri => {
                return this.listRef(`${uri}`).push(item).then(resolve);
            });
        });
    }

    /**
     * Updates an item with the given uid.
     *
     * @param uid
     * @param value
     * @returns {firebase.Promise<void>}
     */
    public update(uid: string, value: T): Promise<void> {
        return new Promise<void>(resolve => {
            return this.getBaseUri().subscribe(uri => {
                delete value.$key;
                return this.oneRef(uri, uid).update(value).then(resolve);
            });
        });
    }

    /**
     * removes the given item in the current reference.
     *
     * @param uid
     * @returns {firebase.Promise<void>}
     */
    public remove(uid: string): Promise<void> {
        return new Promise<void>(resolve => {
            return this.getBaseUri().subscribe(uri => {
                return this.oneRef(uri, uid).remove().then(resolve);
            });
        });
    }

    private listRef(uri: string): FirebaseListObservable<T[]> {
        return this.firebase.list(uri);
    }

    private oneRef(uri: string, uid: string): FirebaseObjectObservable<T> {
        return this.firebase.object(`${uri}/${uid}`);
    }
}
