import {DataModel} from '../data-model';
import {DataStore} from '../data-store';
import {Observable} from 'rxjs/Observable';
import {AngularFireDatabase} from 'angularfire2/database';
import {NgSerializerService} from '@kaiu/ng-serializer';
import {ReplaySubject} from 'rxjs/ReplaySubject';

export abstract class FirebaseStorage<T extends DataModel> extends DataStore<T> {

    protected cache: Map<string, ReplaySubject<T>> = new Map<string, ReplaySubject<T>>();

    constructor(protected firebase: AngularFireDatabase, protected serializer: NgSerializerService) {
        super();
    }

    add(data: T): Observable<string> {
        delete data.$key;
        return Observable.fromPromise(this.firebase.list<T>(this.getBaseUri()).push(data)).map(pushResult => pushResult.key);
    }

    get(uid: string): Observable<T> {
        if (!this.cache.has(uid)) {
            this.cache.set(uid, new ReplaySubject<T>(1));
            this.firebase.object(`${this.getBaseUri()}/${uid}`)
                .snapshotChanges()
                .map(snap => {
                    const valueWithKey: T = {$key: snap.payload.key, ...snap.payload.val()};
                    delete snap.payload;
                    return valueWithKey;
                })
                .map(value => this.serializer.deserialize<T>(value, this.getClass()))
                .subscribe(result => this.cache.get(uid).next(result));
        }
        return this.cache.get(uid);
    }

    update(uid: string, data: T): Observable<void> {
        this.cache.get(uid).next(data);
        delete data.$key;
        return Observable.fromPromise(this.firebase.object(`${this.getBaseUri()}/${uid}`).set(data));
    }

    remove(uid: string): Observable<void> {
        return Observable.fromPromise(this.firebase.object(`${this.getBaseUri()}/${uid}`).remove())
            .do(() => this.cache.get(uid).next(null));
    }

}
