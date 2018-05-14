import {Observable, of, ReplaySubject, Subject, Subscription, throwError as observableThrowError} from 'rxjs';
import {DataModel} from '../data-model';
import {DataStore} from '../data-store';
import {NgSerializerService} from '@kaiu/ng-serializer';
import {NgZone} from '@angular/core';
import {AngularFirestore} from 'angularfire2/firestore';
import {Action} from 'angularfire2/firestore/interfaces';
import {DataResponse} from '../data-response';


import {PendingChangesService} from '../../pending-changes/pending-changes.service';
import {fromPromise} from 'rxjs/internal/observable/fromPromise';
import {debounceTime, map, mergeMap, publishReplay, refCount, tap} from 'rxjs/operators';

export abstract class FirestoreStorage<T extends DataModel> extends DataStore<T> {

    protected cache: { [index: string]: { subject: Subject<DataResponse<T>>, subscription: Subscription } } = {};

    constructor(protected firestore: AngularFirestore, protected serializer: NgSerializerService, protected zone: NgZone,
                protected pendingChangesService: PendingChangesService) {
        super();
    }

    add(data: T): Observable<string> {
        this.pendingChangesService.addPendingChange(`add ${this.getBaseUri()}`);
        const toAdd = JSON.parse(JSON.stringify(data));
        delete toAdd.$key;
        return fromPromise(this.firestore.collection(this.getBaseUri()).add(toAdd))
            .pipe(
                map((ref: any) => {
                    return ref.id;
                }),
                tap((uid: string) => {
                    // In order to enable cache for this newly created element.
                    this.get(uid);
                    this.pendingChangesService.removePendingChange(`add ${this.getBaseUri()}`);
                }));
    }

    get(uid: string): Observable<T> {
        if (this.cache[uid] === undefined) {
            this.cache[uid] = {
                subject: new ReplaySubject<DataResponse<T>>(1),
                subscription: this.firestore.collection(this.getBaseUri()).doc(uid).snapshotChanges()
                    .pipe(
                        map((snap: Action<any>) => {
                            const valueWithKey: T = <T>{$key: snap.payload.id, ...snap.payload.data()};
                            if (!snap.payload.exists) {
                                throw new Error(`${this.getBaseUri()}/${uid} Not found`);
                            }
                            delete snap.payload;
                            return this.serializer.deserialize<T>(valueWithKey, this.getClass());
                        }),
                        debounceTime(50),
                        publishReplay(1),
                        refCount()
                    ).subscribe(data => {
                        this.cache[uid].subject.next({data: data})
                    }, err => {
                        this.cache[uid].subject.next({data: undefined, error: err})
                    })
            };
        }
        return this.cache[uid].subject.pipe(
            mergeMap(response => {
                if (response.error === undefined) {
                    return of(response.data);
                } else {
                    return observableThrowError(response.error)
                }
            }));
    }

    update(uid: string, data: T): Observable<void> {
        this.pendingChangesService.addPendingChange(`update ${this.getBaseUri()}/${uid}`);
        const toUpdate = JSON.parse(JSON.stringify(data));
        delete toUpdate.$key;
        // Optimistic update for better UX with large lists
        if (this.cache[uid] !== undefined) {
            this.cache[uid].subject.next({data: data});
        }
        return this.zone.runOutsideAngular(() => {
            if (uid === undefined || uid === null || uid === '') {
                throw new Error('Empty uid');
            }
            return fromPromise(this.firestore.collection(this.getBaseUri()).doc(uid).update(toUpdate)).pipe(
                tap(() => {
                    this.pendingChangesService.removePendingChange(`update ${this.getBaseUri()}/${uid}`);
                }));
        });
    }

    set(uid: string, data: T): Observable<void> {
        this.pendingChangesService.addPendingChange(`set ${this.getBaseUri()}/${uid}`);
        const toSet = JSON.parse(JSON.stringify(data));
        delete toSet.$key;
        // Optimistic update for better UX with large lists
        if (this.cache[uid] !== undefined) {
            this.cache[uid].subject.next({data: data});
        }
        return this.zone.runOutsideAngular(() => {
            if (uid === undefined || uid === null || uid === '') {
                throw new Error('Empty uid');
            }
            return fromPromise(this.firestore.collection(this.getBaseUri()).doc(uid).set(toSet)).pipe(
                tap(() => {
                    this.pendingChangesService.removePendingChange(`set ${this.getBaseUri()}/${uid}`);
                }));
        });
    }

    remove(uid: string): Observable<void> {
        this.pendingChangesService.addPendingChange(`remove ${this.getBaseUri()}/${uid}`);
        if (uid === undefined || uid === null || uid === '') {
            throw new Error('Empty uid');
        }
        return fromPromise(this.firestore.collection(this.getBaseUri()).doc(uid).delete())
            .pipe(tap(() => {
                // If there's cache information, delete it.
                if (this.cache[uid] !== undefined) {
                    this.cache[uid].subscription.unsubscribe();
                    this.cache[uid].subject.next(null);
                    delete this.cache[uid];
                }
                this.pendingChangesService.removePendingChange(`remove ${this.getBaseUri()}/${uid}`);
            }));
    }

}
