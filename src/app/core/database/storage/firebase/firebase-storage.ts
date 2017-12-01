import {DataModel} from '../data-model';
import {DataStore} from '../data-store';
import {Observable} from 'rxjs/Observable';
import {AngularFireDatabase} from 'angularfire2/database';
import {NgSerializerService} from '@kaiu/ng-serializer';
import {DiffService} from 'app/core/database/diff/diff.service';

export abstract class FirebaseStorage<T extends DataModel> extends DataStore<T> {

    private static UPDATE_START;

    protected cache: { [index: string]: T } = {};

    constructor(protected firebase: AngularFireDatabase, protected serializer: NgSerializerService,
                protected diffService: DiffService) {
        super();
    }

    add(data: T): Observable<string> {
        delete data.$key;
        return Observable.fromPromise(this.firebase.list<T>(this.getBaseUri()).push(data))
            .map(pushResult => pushResult.key)
            .do(key => {
                this.cache[key] = JSON.parse(JSON.stringify(data));
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
            .distinctUntilChanged((a, b) => {
                return !this.diffService.diff(a, b).isEmpty();
            })
            .do(data => {
                // Cache a clone of the data.
                this.cache[data.$key] = JSON.parse(JSON.stringify(data));
                if (FirebaseStorage.UPDATE_START !== undefined) {
                    console.log(Date.now() - FirebaseStorage.UPDATE_START);
                }
            })
            .publishReplay(1)
            .refCount();
    }

    update(uid: string, data: T): Observable<void> {
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
        FirebaseStorage.UPDATE_START = Date.now();
        return Observable.combineLatest(batch, () => {
        });
    }

    remove(uid: string): Observable<void> {
        return Observable.fromPromise(this.firebase.object(`${this.getBaseUri()}/${uid}`).remove())
            .do(() => {
                delete this.cache[uid];
            });
    }

}
