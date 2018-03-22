import {Injectable, NgZone} from '@angular/core';
import {FirebaseStorage} from '../storage/firebase/firebase-storage';
import {CustomLink} from './costum-link';
import {NgSerializerService} from '@kaiu/ng-serializer';
import {AngularFireDatabase} from 'angularfire2/database';
import {DiffService} from '../diff/diff.service';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class CustomLinksService extends FirebaseStorage<CustomLink> {

    constructor(protected database: AngularFireDatabase,
                protected serializer: NgSerializerService,
                protected diffService: DiffService,
                protected zone: NgZone) {
        super(database, serializer, diffService, zone);
    }

    public getAllByAuthor(userKey: string): Observable<CustomLink[]> {
        return this.firebase.list(this.getBaseUri(), ref => ref.orderByChild('author').equalTo(userKey))
            .snapshotChanges()
            .map(snaps => snaps
                .map(snap => ({$key: snap.payload.key, ...snap.payload.val()}))
                .map(l => this.serializer.deserialize<CustomLink>(l, CustomLink))
            );
    }

    public getByUriAndNickname(uri: string, nickName: string): Observable<CustomLink> {
        return this.firebase.list(this.getBaseUri(), ref => ref.orderByChild('uri').equalTo(uri))
            .snapshotChanges()
            .first()
            .map(snaps => snaps
                .map(snap => ({$key: snap.payload.key, ...snap.payload.val()}))
                .map(l => this.serializer.deserialize<CustomLink>(l, CustomLink))
            )
            .map(res => res.filter(link => link.authorNickname === nickName))
            .map(res => res[0]);
    }

    protected getBaseUri(): string {
        return 'custom_links';
    }

    protected getClass(): any {
        return CustomLink;
    }

}
