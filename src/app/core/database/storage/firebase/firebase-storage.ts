import {DataModel} from '../data-model';
import {DataStore} from '../data-store';
import {Observable} from 'rxjs/Observable';
import {AngularFireDatabase} from 'angularfire2/database';
import {NgSerializerService} from '@kaiu/ng-serializer';

export abstract class FirebaseStorage<T extends DataModel> extends DataStore<T> {

    constructor(protected firebase: AngularFireDatabase, protected serializer: NgSerializerService) {
        super();
    }

    add(data: T): Observable<string> {
        delete data.$key;
        return Observable.fromPromise(this.firebase.list<T>(this.getBaseUri()).push(data)).map(pushResult => pushResult.key);
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
            .distinctUntilChanged()
            .publishReplay(1)
            .refCount();
    }

    update(uid: string, data: T): Observable<void> {
        delete data.$key;
        return Observable.fromPromise(this.firebase.object(`${this.getBaseUri()}/${uid}`).update(data));
    }

    remove(uid: string): Observable<void> {
        return Observable.fromPromise(this.firebase.object(`${this.getBaseUri()}/${uid}`).remove());
    }

}
