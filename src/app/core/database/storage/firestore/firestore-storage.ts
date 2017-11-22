import {Observable} from 'rxjs/Observable';
import {NgSerializerService} from '@kaiu/ng-serializer';
import {DataModel} from '../data-model';
import {AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument} from 'angularfire2/firestore';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/operator/first';
import {DataStore} from 'app/core/database/storage/data-store';
import {METADATA_SUBCOLLECTION} from './decorator/subcollection';
import {Class} from '@kaiu/serializer';
import {DocumentChangeAction, QueryFn} from 'angularfire2/firestore/interfaces';
import {ReplaySubject} from 'rxjs/ReplaySubject';
import {DataState} from '../data-state.enum';

/**
 * @deprecated Not finished, don't use for production
 */
export abstract class FirestoreStorage<T extends DataModel> implements DataStore<T> {

    protected cache: { [id: string]: ReplaySubject<T> } = {};

    private static generateObject(data: any): object {
        const clone: DataModel = JSON.parse(JSON.stringify(data));
        // If any of the field inside our item is a subcollection, remove it from the clone.
        Object.keys(data).forEach(key => {
            if (Reflect.hasMetadata(METADATA_SUBCOLLECTION, data, key)) {
                delete clone[key];
            }
        });
        if (clone instanceof Array) {
            clone.forEach(row => {
                delete row.$key;
                delete row.state;
            });
        } else {
            delete clone.$key;
            delete clone.state;
        }
        return clone;
    }

    constructor(protected afdb: AngularFirestore, protected serializer: NgSerializerService) {
    }

    protected abstract getBaseUri(params?: any): Observable<string>;

    protected abstract getClass(): any;

    public getAll(query?: QueryFn, params?: any): Observable<T[]> {
        return this.getBaseUri(params).switchMap(uri => {
            return this.collectionRef(uri, query)
                .snapshotChanges()
                .switchMap((snap: DocumentChangeAction[]) => {
                    const detailedDataResult: Observable<T>[] = [];
                    // Get only the ids.
                    snap.map(row => row.payload.doc.id)
                        .forEach(uid => {
                            // Push a new request to the cache using the get method.
                            detailedDataResult.push(this.get(uid, params));
                        });
                    return Observable.combineLatest(detailedDataResult, (...results: T[]) => {
                        return results.filter(row => row.state !== DataState.DELETED);
                    });
                });
        })
    }

    /**
     * Gets one object from database as T instance
     *
     * @param uid
     * @param params
     * @returns {Observable<R>}
     */
    public get(uid: string, params?: any): Observable<T> {
        if (this.cache[uid] === undefined) {
            this.cache[uid] = new ReplaySubject<T>(1);
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
                    }).switchMap((resultData) => {
                        return this.fetchSubCollections(uri, resultData);
                    });
            }).subscribe(res => {
                this.cache[uid].next(res);
            }, error => this.cache[uid].error(error));
        }
        return this.cache[uid].asObservable()
            .filter(data => data.state !== DataState.DELETED)
            .switchMap(filteredData => {
                return this.forEachSubcollection(filteredData, (data, key) => {
                    data[key] = data[key].filter(row => {
                        return row.state !== DataState.DELETED;
                    });
                    return Observable.of(data);
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
    public add(item: T, params?: any): Observable<string> {
        return this.getBaseUri(params).switchMap(uri => {
            return Observable.fromPromise(this.collectionRef(`${uri}`)
                .add(<T>FirestoreStorage.generateObject(item)))
                .map(ref => ref.id)
                .switchMap(refId => {
                    return this.forEachSubcollection(item, (data, key) => {
                        const batch: Observable<any>[] = [];
                        const collectionRef = this.collectionRef<any>(`${uri}/${refId}/${key}`);
                        data[key].forEach(row => {
                            batch.push(Observable.fromPromise(collectionRef.add(FirestoreStorage.generateObject(row))));
                        });
                        item.$key = refId;
                        return Observable.combineLatest(batch).map(() => item);
                    });
                }).map(res => {
                    return res.$key;
                });
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
        const start = Date.now();
        return this.getBaseUri(params).switchMap(uri => {
            this.cache[uid].next(value);
            return Observable.fromPromise(
                this.oneRef(uri, uid)
                    .set(<T>FirestoreStorage.generateObject(value)))
                .switchMap(() => {
                    return this.forEachSubcollection(value, (data, key) => {
                        const subCollectionRef = this.collectionRef<any>(`${uri}/${uid}/${key}`);
                        const operations: Observable<any>[] = [];
                        value[key].forEach(row => {
                            if (row.$key === undefined) {
                                operations.push(
                                    Observable.fromPromise(subCollectionRef
                                        .add(FirestoreStorage.generateObject(row))));
                            } else {
                                if (row.state === DataState.MODIFIED) {
                                    operations.push(
                                        Observable.fromPromise(subCollectionRef.doc(row.$key)
                                            .update(FirestoreStorage.generateObject(row))));
                                }
                                if (row.state === DataState.DELETED) {
                                    operations.push(
                                        Observable.fromPromise(subCollectionRef.doc(row.$key)
                                            .delete()));
                                }
                            }
                        });
                        if (operations.length === 0) {
                            return Observable.of(null);
                        }
                        return Observable.combineLatest(...operations);
                    }).map(() => null);
                });
        }).do(() => console.log('UPDATE', Date.now() - start));
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

    private fetchSubCollections(uri: string, resultData: T): Observable<T> {
        return this.forEachSubcollection(resultData, (data, key, clazz) => {
            return this.collectionRef(`${uri}/${data.$key}/${key}`)
                .snapshotChanges()
                .map(snap => {
                    const obj = snap.map(snapRow => snapRow.payload.doc.data());
                    const res: any[] = this.serializer.deserialize(obj, [clazz]);
                    res.forEach((row, index) => {
                        row.$key = snap[index].payload.doc.id;
                    });
                    return res;
                }).map(result => {
                    data[key] = result;
                    return data;
                });
        });
    }

    private forEachSubcollection(data: T, project: (data: T, collectionKey: string, clazz?: Class) => Observable<T>): Observable<T> {
        const operations: Observable<T>[] = [];
        Object.keys(data).forEach(key => {
            if (Reflect.hasMetadata(METADATA_SUBCOLLECTION, data, key)) {
                operations.push(project(data, key, Reflect.getMetadata(METADATA_SUBCOLLECTION, data, key)));
            }
        });
        if (operations.length === 0) {
            return Observable.of(data);
        }
        return Observable.combineLatest(operations, (...results) => {
            // Because data is passed as reference, we can take the first one.
            return results[0];
        });
    }

    private collectionRef<R = T>(uri: string, query?: QueryFn): AngularFirestoreCollection<R> {
        return this.afdb.collection<R>(uri, query);
    }

    private oneRef<R = T>(uri: string, uid: string): AngularFirestoreDocument<R> {
        return this.afdb.doc<R>(`${uri}/${uid}`);
    }
}
