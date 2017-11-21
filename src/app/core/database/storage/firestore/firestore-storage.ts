import {Observable} from 'rxjs/Observable';
import {NgSerializerService} from '@kaiu/ng-serializer';
import {DataModel} from '../../../../model/list/data-model';
import {AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument} from 'angularfire2/firestore';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/operator/first';
import {DataStore} from 'app/core/database/storage/data-store';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {METADATA_SUBCOLLECTION} from './decorator/subcollection';
import {Class} from '@kaiu/serializer';
import {DocumentChangeAction, QueryFn} from 'angularfire2/firestore/interfaces';

export abstract class FirestoreStorage<T extends DataModel> implements DataStore<T> {

    protected cache: { [id: string]: BehaviorSubject<T> } = {};

    private static generateObject(data: any): object {
        const clone = JSON.parse(JSON.stringify(data));
        // If any of the field inside our item is a subcollection, remove it from the clone.
        Object.keys(data).forEach(key => {
            if (Reflect.hasMetadata(METADATA_SUBCOLLECTION, data, key)) {
                delete clone[key];
            }
        });
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
                    const obj = snap.map(snapRow => snapRow.payload.doc.data());
                    const res: T[] = this.serializer.deserialize<T>(obj, [this.getClass()]);
                    res.forEach((row, index) => {
                        row.$key = snap[index].payload.doc.id;
                        if (this.cache[row.$key] === undefined) {
                            this.cache[row.$key] = new BehaviorSubject<T>(null);
                            detailedDataResult.push(this.fetchSubCollections(uri, row));
                        }
                    });
                    return Observable.combineLatest(detailedDataResult);
                }).do(results => {
                results.forEach(result => {
                    this.cache[result.$key].next(result);
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
                    }).switchMap((resultData) => {
                        return this.fetchSubCollections(uri, resultData);
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
        return this.getBaseUri(params).switchMap(uri => {
            const previousValue = this.cache[uid].getValue();
            // If the value is the same as the value cached, don't update it
            if (previousValue === value) {
                return Observable.of(null);
            }
            this.cache[uid].next(value);
            delete value.$key;
            return Observable.fromPromise(this.oneRef(uri, uid).set(<T>value))
                .switchMap(() => {
                    return this.forEachSubcollection(value, (data, key) => {
                        const subCollectionRef = this.collectionRef(`${uri}/${uid}/${key}`);
                        const operations: Observable<any>[] = [];
                        previousValue[key].forEach(previousRow => {
                            const newRow = value[key].filter(row => row.$key === previousRow.$key);
                            if (newRow === previousRow) {
                                return;
                            }
                            if (newRow === undefined) {
                                operations.push(Observable.fromPromise(subCollectionRef.doc(previousRow.$key).delete()));
                                return;
                            }
                            if (newRow !== previousRow) {
                                operations.push(Observable.fromPromise(subCollectionRef.doc(previousRow.$key).update(newRow)));
                                return;
                            }
                            if (previousRow === undefined) {
                                operations.push(Observable.fromPromise(subCollectionRef.add(newRow)));
                            }
                        });
                        if (operations.length === 0) {
                            return Observable.of(null);
                        }
                        return Observable.combineLatest(...operations);
                    });
                });
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
