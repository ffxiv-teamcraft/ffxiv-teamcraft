import {AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable} from 'angularfire2/database';
import {Observable} from 'rxjs/Observable';
import {NgSerializerService} from '@kaiu/ng-serializer/ng-serializer.service';
import * as firebase from 'firebase/app';
import ThenableReference = firebase.database.ThenableReference;
import Promise = firebase.Promise;

export abstract class StoredDataService<T> {

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
        return this.oneRef(uid).map(obj => this.serializer.deserialize(obj, this.getClass()));
    }

    /**
     * Gets the list of items in this base uri.
     *
     * @returns {Observable<R>}
     */
    public getAll(): Observable<T[]> {
        return this.listRef.map(obj => this.serializer.deserialize(obj, [this.getClass()]));
    }

    /**
     * Pushes an item in the database list.
     *
     * @param item
     * @returns {firebase.database.ThenableReference}
     */
    public push(item: T): ThenableReference {
        return this.listRef.push(item);
    }

    /**
     * Updates an item with the given uid.
     *
     * @param uid
     * @param value
     * @returns {firebase.Promise<void>}
     */
    public update(uid: string, value: T): Promise<void> {
        return this.oneRef(uid).update(value);
    }

    /**
     * removes the given item in the current reference.
     *
     * @param uid
     * @returns {firebase.Promise<void>}
     */
    public remove(uid: string): Promise<void> {
        return this.oneRef(uid).remove();
    }

    private get listRef(): FirebaseListObservable<T[]> {
        return this.getBaseUri().mergeMap(uri => this.firebase.list(`${uri}`)) as FirebaseListObservable<T[]>;
    }

    private oneRef(uid: string): FirebaseObjectObservable<T> {
        return this.firebase.object(`${this.getBaseUri()}/${uid}`);
    }
}
