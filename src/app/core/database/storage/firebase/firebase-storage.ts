import {DataModel} from '../data-model';
import {DataStore} from '../data-store';
import {Observable} from 'rxjs/Observable';
import {AngularFireDatabase} from 'angularfire2/database';
import {NgSerializerService} from '@kaiu/ng-serializer';
import {DiffService} from 'app/core/database/diff/diff.service';
import {NgZone} from '@angular/core';
import 'rxjs/add/operator/takeWhile';
import 'rxjs/add/operator/do';
import {PendingChangesService} from '../../pending-changes/pending-changes.service';

export abstract class FirebaseStorage<T extends DataModel> extends DataStore<T> {

    protected cache: { [index: string]: T } = {};

    constructor(protected firebase: AngularFireDatabase, protected serializer: NgSerializerService,
                protected diffService: DiffService, protected zone: NgZone,
                protected pendingChangesService: PendingChangesService) {
        super();
    }

    add(data: T): Observable<string> {
        this.pendingChangesService.addPendingChange(`add ${this.getBaseUri()}`);
        delete data.$key;
        return Observable.fromPromise(this.firebase.list<T>(this.getBaseUri()).push(data))
            .map(pushResult => pushResult.key)
            .do(key => {
                this.cache[key] = JSON.parse(JSON.stringify(data));
                this.pendingChangesService.removePendingChange(`add ${this.getBaseUri()}`);
            });
    }

    get(uid: string): Observable<T> {
        return this.firebase.object(`${this.getBaseUri()}/${uid}`)
            .snapshotChanges()
            .map(snap => {
                const valueWithKey: T = {$key: snap.payload.key, ...snap.payload.val()};
                if (!snap.payload.exists()) {
                    throw new Error('Not found');
                }
                delete snap.payload;
                return this.serializer.deserialize<T>(valueWithKey, this.getClass());
            })
            .do(data => {
                // Cache a clone of the data.
                this.cache[data.$key] = JSON.parse(JSON.stringify(data));
            })
            .debounceTime(50)
            .publishReplay(1)
            .refCount();
    }

    getAll(): Observable<T[]> {
        return this.firebase.list(this.getBaseUri())
            .snapshotChanges()
            .map(snaps => {
                return snaps.map(snap => {
                    const valueWithKey: T = {$key: snap.payload.key, ...snap.payload.val()};
                    if (!snap.payload.exists()) {
                        throw new Error('Not found');
                    }
                    delete snap.payload;
                    return this.serializer.deserialize<T>(valueWithKey, this.getClass());
                });
            })
            .do(datas => {
                datas.forEach(data => {
                    // Cache a clone of the data.
                    this.cache[data.$key] = JSON.parse(JSON.stringify(data));
                })
            })
            .debounceTime(50)
            .publishReplay(1)
            .refCount();
    }

    update(uid: string, data: T): Observable<void> {
        this.pendingChangesService.addPendingChange(`update ${this.getBaseUri()}/${uid}`);
        return this.zone.runOutsideAngular(() => {
            if (uid === undefined || uid === null || uid === '') {
                throw new Error('Empty uid');
            }
            const before = this.cache[uid];
            const diff = this.diffService.diff(before, data);
            const batch: Observable<void>[] = [];
            // We are going to treat additions and modifications the same way.
            diff.added.concat(diff.modified).forEach(row => {
                // For each addition/modification, prepare a set operation
                batch.push(Observable.fromPromise(this.firebase.object(`${this.getBaseUri()}/${uid}${row.path}`).set(row.value)))
            });
            diff.deleted.forEach(deletion => {
                // For each deletion operation, prepare a delete operation.
                batch.push(Observable.fromPromise(this.firebase.object(`${this.getBaseUri()}/${uid}${deletion.path}`).remove()));
            });
            // We map the result of the combine to a void function, because we want to convert void[] to void.
            return Observable.combineLatest(batch, () => {
            }).do(() => {
                this.pendingChangesService.removePendingChange(`update ${this.getBaseUri()}/${uid}`);
            });
        });
    }

    set(uid: string, data: T): Observable<void> {
        this.pendingChangesService.addPendingChange(`set ${this.getBaseUri()}/${uid}`);
        return this.zone.runOutsideAngular(() => {
            if (uid === undefined || uid === null || uid === '') {
                this.firebase.list('logs').push('Empty uid');
                throw new Error('Empty uid');
            }
            const clone = JSON.parse(JSON.stringify(data));
            delete clone.$key;
            return Observable.fromPromise(this.firebase.object(`${this.getBaseUri()}/${uid}`).set(clone)).do(() => {
                this.pendingChangesService.removePendingChange(`set ${this.getBaseUri()}/${uid}`);
            });
        });
    }

    remove(uid: string): Observable<void> {
        this.pendingChangesService.addPendingChange(`remove ${this.getBaseUri()}/${uid}`);
        if (uid === undefined || uid === null || uid === '') {
            this.firebase.list('logs').push('Empty uid');
            throw new Error('Empty uid');
        }
        return Observable.fromPromise(this.firebase.object(`${this.getBaseUri()}/${uid}`).remove())
            .do(() => {
                delete this.cache[uid];
                this.pendingChangesService.removePendingChange(`remove ${this.getBaseUri()}/${uid}`);
            });
    }

}
