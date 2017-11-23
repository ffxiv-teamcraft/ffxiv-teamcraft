import {FirebaseStorage} from '../firebase/firebase-storage';
import {List} from '../../../../model/list/list';
import {Injectable} from '@angular/core';
import {ListStore} from './list-store';
import {Observable} from 'rxjs/Observable';
import {AngularFireDatabase, AngularFireList} from 'angularfire2/database';
import {NgSerializerService} from '@kaiu/ng-serializer';

@Injectable()
export class FirebaseListStorage extends FirebaseStorage<List> implements ListStore {

    constructor(protected firebase: AngularFireDatabase, protected serializer: NgSerializerService) {
        super(firebase, serializer);
    }

    byAuthor(uid: string): Observable<List[]> {
        return this.listsByAuthorRef(uid)
            .snapshotChanges()
            .map(snaps => snaps.map(snap => ({$key: snap.payload.key, ...snap.payload.val()})));
    }

    deleteByAuthor(uid: string): Observable<void> {
        return Observable.fromPromise(this.listsByAuthorRef(uid).remove());
    }

    private listsByAuthorRef(uid: string): AngularFireList<List> {
        return this.firebase.list(this.getBaseUri(), ref => ref.orderByChild('authorId').equalTo(uid));
    }

    protected getBaseUri(): string {
        return 'lists';
    }

    protected getClass(): any {
        return List;
    }
}
