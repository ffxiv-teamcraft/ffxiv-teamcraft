import {Observable} from 'rxjs/Observable';
import {NgSerializerService} from '@kaiu/ng-serializer';
import {DataModel} from '../../../../model/list/data-model';
import * as firebase from 'firebase/app';
import {AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument} from 'angularfire2/firestore';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/operator/first';
import {DataStore} from 'app/core/database/storage/data-store';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

export abstract class FirestoreStorage<T extends DataModel> implements DataStore<T> {

    protected cache: { [id: string]: BehaviorSubject<T> } = {};

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
        if (this.cache[uid] === undefined) {
            this.cache[uid] = new BehaviorSubject<T>(null);
            this.getBaseUri(params).switchMap(uri => {
                return this.oneRef(uri, uid)
                    .snapshotChanges()
                    .map(doc => {
                        if (!doc.payload.exists) {
                            throw new Error('Not found');
                        }
                        const obj = doc.payload.data();
                        const res: T = this.serializer.deserialize<T>(obj, this.getClass());
                        res.$key = doc.payload.id;
                        return res;
                    });
            }).subscribe(res => {
                this.cache[uid].next(res);
            });
        }
        return this.cache[uid].asObservable().filter(data => data !== null);
    }

    /**
     * Pushes an item in the database list-details.
     *
     * @param item
     * @param params
     * @returns {firebase.database.ThenableReference}
     */
    public add(item: T, params?: any): Observable<string> {
        return this.getBaseUri(params).switchMap(uri => {
            return Observable.fromPromise(this.listRef(`${uri}`).add(<T>item.getData())).map(ref => ref.id);
        });
    }

    /**
     * Updates an item with the given uid.
     *
     * @param uid
     * @param value
     * @param params
     * @returns {Observable<void>}
     */
    public update(uid: string, value: T, params?: any): Observable<void> {
        return this.getBaseUri(params).switchMap(uri => {
            // If the value is the same as the value cached, don't update it
            if (this.cache[uid].getValue() === value) {
                return Observable.of(null);
            }
            this.cache[uid].next(value);
            delete value.$key;
            return Observable.fromPromise(this.oneRef(uri, uid).set(<T>value.getData()));
        });
    }

    /**
     * removes the given item in the current reference.
     *
     * @param uid
     * @param params
     * @returns {Observable<void>}
     */
    public remove(uid: string, params?: any): Observable<void> {
        return this.getBaseUri(params).switchMap(uri => {
            return Observable.fromPromise(this.oneRef(uri, uid).delete());
        });
    }

    private listRef(uri: string): AngularFirestoreCollection<T> {
        return this.afdb.collection<T>(uri);
    }

    private oneRef(uri: string, uid: string): AngularFirestoreDocument<T> {
        return this.afdb.doc<T>(`${uri}/${uid}`);
    }
}
