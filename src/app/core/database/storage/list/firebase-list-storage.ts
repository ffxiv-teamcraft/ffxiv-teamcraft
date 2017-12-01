import {FirebaseStorage} from '../firebase/firebase-storage';
import {List} from '../../../../model/list/list';
import {Injectable} from '@angular/core';
import {ListStore} from './list-store';
import {Observable} from 'rxjs/Observable';
import {AngularFireDatabase, AngularFireList} from 'angularfire2/database';
import {NgSerializerService} from '@kaiu/ng-serializer';
import {DiffService} from '../../diff/diff.service';

@Injectable()
export class FirebaseListStorage extends FirebaseStorage<List> implements ListStore {

    constructor(protected firebase: AngularFireDatabase, protected serializer: NgSerializerService, protected diffService: DiffService) {
        super(firebase, serializer, diffService);
    }

    getPublicLists(): Observable<List[]> {
        return this.firebase.list(this.getBaseUri(), ref => ref.orderByChild('public').equalTo(true))
            .snapshotChanges()
            .map(snaps => snaps.map(snap => ({$key: snap.payload.key, ...snap.payload.val()})))
            .map(lists => this.serializer.deserialize<List>(lists, [List]))
            .map(lists => lists.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
            .do(lists => lists.forEach(list => this.cache[list.$key] = JSON.parse(JSON.stringify(list))));
    }

    byAuthor(uid: string): Observable<List[]> {
        return this.listsByAuthorRef(uid)
            .snapshotChanges()
            .map(snaps => snaps.map(snap => ({$key: snap.payload.key, ...snap.payload.val()})))
            .map(lists => this.serializer.deserialize<List>(lists, [List]))
            .map(lists => lists.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
            .do(lists => lists.forEach(list => this.cache[list.$key] = JSON.parse(JSON.stringify(list))));
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
